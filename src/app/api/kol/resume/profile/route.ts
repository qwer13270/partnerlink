import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import type { SocialLinks } from '@/data/mock-resume'

type ProfilePayload = {
  displayName?: string
  bio?: string
  followerCount?: number
  nicheTags?: string[]
  socialLinks?: SocialLinks
  collabFee?: number | null
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions)
          })
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as ProfilePayload
  const { collabFee, ...resumeFields } = body

  const admin = getSupabaseAdminClient()

  // Save resume fields (everything except collabFee) to user metadata
  const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      kol_resume: {
        ...(user.user_metadata?.kol_resume ?? {}),
        ...resumeFields,
      },
    },
  })

  if (metaError) {
    return NextResponse.json({ error: metaError.message }, { status: 500 })
  }

  // Save collabFee to kol_applications — single source of truth for the fee
  if ('collabFee' in body) {
    const feeValue = typeof collabFee === 'number' ? collabFee : null
    const { error: feeError } = await admin
      .from('kol_applications')
      .update({ collab_fee: feeValue })
      .eq('user_id', user.id)

    if (feeError) {
      console.error('[api/kol/resume/profile] collab_fee update:', feeError.message)
      return NextResponse.json({ error: feeError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
