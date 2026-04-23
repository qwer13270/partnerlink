import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'
import { sendEmail } from '@/lib/email/send'
import { getAppUrl } from '@/lib/email/resend'
import MerchantApprovalEmail from '@/emails/MerchantApprovalEmail'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing application id.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { data: application, error: findError } = await admin
    .from('merchant_applications')
    .select('id,user_id,status,email,company_name,contact_name,phone,city,merchant_type')
    .eq('id', id)
    .single()

  if (findError || !application) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
  }

  if (!application.user_id) {
    return NextResponse.json({ error: 'Application is missing a linked auth user.' }, { status: 409 })
  }

  if (!['pending_admin_review', 'denied'].includes(application.status)) {
    return NextResponse.json(
      { error: `Application is already ${application.status}.` },
      { status: 409 },
    )
  }

  const { data: userResult, error: getUserError } = await admin.auth.admin.getUserById(application.user_id)
  if (getUserError || !userResult.user) {
    return NextResponse.json(
      { error: `Failed to load user: ${getUserError?.message ?? 'User not found.'}` },
      { status: 500 },
    )
  }

  const { error: updateUserError } = await admin.auth.admin.updateUserById(
    application.user_id,
    {
      app_metadata: {
        ...userResult.user.app_metadata,
        role: 'merchant',
      },
    },
  )

  if (updateUserError) {
    return NextResponse.json(
      { error: `Failed to activate merchant role: ${updateUserError.message}` },
      { status: 500 },
    )
  }

  const now = new Date().toISOString()
  const { error: upsertProfileError } = await admin
    .from('merchant_profiles')
    .upsert({
      user_id: application.user_id,
      application_id: application.id,
      email: application.email,
      company_name: application.company_name,
      contact_name: application.contact_name,
      phone: application.phone,
      city: application.city,
      merchant_type: application.merchant_type ?? null,
      status: 'active',
      updated_at: now,
    }, { onConflict: 'user_id' })

  if (upsertProfileError) {
    return NextResponse.json(
      { error: `Failed to create merchant profile: ${upsertProfileError.message}` },
      { status: 500 },
    )
  }

  const { error: updateAppError } = await admin
    .from('merchant_applications')
    .update({
      status: 'approved',
      reviewed_at: now,
      reviewed_by: auth.user.id,
      rejection_reason: null,
    })
    .eq('id', id)

  if (updateAppError) {
    return NextResponse.json(
      { error: `Failed to update application status: ${updateAppError.message}` },
      { status: 500 },
    )
  }

  const recipient = application.email ?? userResult.user.email
  if (recipient) {
    const result = await sendEmail({
      to: recipient,
      subject: '你的 PartnerLink 商家申請已通過審核',
      react: MerchantApprovalEmail({
        contactName: application.contact_name ?? '夥伴',
        companyName: application.company_name ?? '你的商家',
        merchantType: (application.merchant_type as 'property' | 'shop' | null) ?? null,
        appUrl: getAppUrl(),
      }),
      tags: [{ name: 'type', value: 'merchant_approval' }],
    })
    if (!result.ok) {
      console.error('[api/admin/merchant-applications/approve] email:', result.error)
    }
  } else {
    console.error('[api/admin/merchant-applications/approve] email: no recipient address')
  }

  return NextResponse.json({ ok: true })
}
