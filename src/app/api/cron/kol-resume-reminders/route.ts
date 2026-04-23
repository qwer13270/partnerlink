import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { getAppUrl } from '@/lib/email/resend'
import KolResumeReminderEmail from '@/emails/KolResumeReminderEmail'
import {
  selectKolsNeedingReminder,
  type ApprovedKolRow,
  type MediaAssetRow,
  type ReminderLogRow,
} from '@/lib/kol-reminder'

export const dynamic = 'force-dynamic'

// Only consider KOLs approved within this window, plus a small buffer so a
// missed cron day can still catch stage 14.
const LOOKBACK_DAYS = 16

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured.' }, { status: 500 })
  }
  const header = request.headers.get('authorization')
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const admin = getSupabaseAdminClient()
  const now = new Date()
  const lookbackIso = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: approvedKols, error: kolError } = await admin
    .from('kol_applications')
    .select('user_id,email,full_name,reviewed_at,profile_photo_path')
    .eq('status', 'approved')
    .not('reviewed_at', 'is', null)
    .gte('reviewed_at', lookbackIso)
    .returns<ApprovedKolRow[]>()

  if (kolError || !approvedKols) {
    console.error('[api/cron/kol-resume-reminders] load kols:', kolError?.message)
    return NextResponse.json({ error: 'Failed to load KOLs.' }, { status: 500 })
  }

  if (approvedKols.length === 0) {
    return NextResponse.json({ processed: 0, sent: 0, errors: 0 })
  }

  const userIds = approvedKols.map((k) => k.user_id)

  const [{ data: mediaAssets, error: assetsError }, { data: sentLog, error: logError }] = await Promise.all([
    admin
      .from('kol_media_assets')
      .select('user_id,media_type,storage_path')
      .in('user_id', userIds)
      .returns<MediaAssetRow[]>(),
    admin
      .from('kol_reminder_log')
      .select('user_id,reminder_stage')
      .in('user_id', userIds)
      .returns<ReminderLogRow[]>(),
  ])

  if (assetsError || logError) {
    console.error('[api/cron/kol-resume-reminders] load deps:', assetsError?.message ?? logError?.message)
    return NextResponse.json({ error: 'Failed to load dependencies.' }, { status: 500 })
  }

  const recipients = selectKolsNeedingReminder({
    now,
    approvedKols,
    mediaAssets: mediaAssets ?? [],
    sentLog: sentLog ?? [],
  })

  let sent = 0
  let errors = 0
  const appUrl = getAppUrl()

  for (const r of recipients) {
    const result = await sendEmail({
      to: r.email,
      subject: '完成你的 PartnerLink 履歷，開始接洽合作',
      react: KolResumeReminderEmail({
        fullName: r.full_name,
        stage: r.stage,
        missingPhoto: r.missingPhoto,
        missingPortfolio: r.missingPortfolio,
        appUrl,
      }),
      tags: [
        { name: 'type', value: 'kol_resume_reminder' },
        { name: 'stage', value: String(r.stage) },
      ],
    })

    if (!result.ok) {
      errors += 1
      console.error('[api/cron/kol-resume-reminders] send failed:', r.user_id, result.error)
      continue
    }

    const { error: insertError } = await admin
      .from('kol_reminder_log')
      .insert({ user_id: r.user_id, reminder_stage: r.stage })

    if (insertError) {
      errors += 1
      console.error('[api/cron/kol-resume-reminders] log insert failed:', r.user_id, insertError.message)
      continue
    }

    sent += 1
  }

  return NextResponse.json({
    processed: recipients.length,
    sent,
    errors,
  })
}
