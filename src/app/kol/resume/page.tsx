import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  getUsernameFromUser,
  getResumeByUsername,
  createDefaultResume,
  type SocialLinks,
} from '@/data/mock-resume'
import { Eye, Pencil } from 'lucide-react'
import { ResumeAvatar } from '@/components/kol/KolResumePage'

function formatFollowers(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)} 萬`
  return n.toLocaleString('zh-TW')
}

export default async function KolResumeHubPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) redirect('/login')

  const username = getUsernameFromUser(user)
  const baseResume = getResumeByUsername(username) ?? createDefaultResume(username)

  const admin = getSupabaseAdminClient()
  const { data: application } = await admin
    .from('kol_applications')
    .select('full_name,profile_photo_path')
    .eq('user_id', user.id)
    .maybeSingle()

  const savedResume = user.user_metadata?.kol_resume as {
    displayName?: string
    bio?: string
    followerCount?: number
    nicheTags?: string[]
    socialLinks?: SocialLinks
  } | undefined

  const signupFullName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof application?.full_name === 'string' && application.full_name) ||
    undefined

  const resume = {
    ...baseResume,
    displayName: savedResume?.displayName ?? signupFullName ?? '',
  }

  // Resolve & sign profile photo
  const profilePhotoPath =
    (typeof user.user_metadata?.profile_photo_path === 'string' && user.user_metadata.profile_photo_path) ||
    (typeof application?.profile_photo_path === 'string' && application.profile_photo_path) ||
    ''

  let profilePhotoUrl: string | null = null
  if (profilePhotoPath) {
    const { data: signed } = await admin.storage
      .from('kol-media')
      .createSignedUrl(profilePhotoPath, 60 * 60)
    profilePhotoUrl = signed?.signedUrl ?? null
  }

  return (
    <div className="w-full">

      {/* ── Page heading ──────────────────────────────────────── */}
      <div className="mb-8">
        <p className="mb-2 text-[0.55rem] uppercase tracking-[0.55em] text-muted-foreground">
          PartnerLink · KOL
        </p>
        <h1 className="font-serif text-3xl leading-snug tracking-tight text-foreground">
          我的履歷
        </h1>
      </div>

      {/* ── Profile card — full width ─────────────────────────── */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-foreground/[0.08] bg-background">

        <div className="relative z-10 px-8 py-8">
          {/* Top row: avatar + name + handle */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative shrink-0">
              <div className="absolute inset-[-10px] rounded-full border border-foreground/[0.06]" />
              <div className="absolute inset-[-4px] rounded-full border border-foreground/[0.10]" />
              <ResumeAvatar
                name={resume.displayName || username}
                photoUrl={profilePhotoUrl}
                className="h-16 w-16 border border-foreground/[0.12]"
              />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-2xl leading-tight tracking-tight text-foreground/90">
                {resume.displayName || username}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">@{username}</p>
              {resume.nicheTags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {resume.nicheTags.slice(0, 5).map((tag) => (
                    <span key={tag} className="rounded-sm border border-foreground/[0.10] px-2 py-0.5 text-[0.52rem] uppercase tracking-[0.15em] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-foreground/[0.08] border-t border-foreground/[0.08] pt-6">
            {resume.followerCount > 0 && (
              <div className="pr-6">
                <p className="text-[0.5rem] uppercase tracking-[0.4em] text-muted-foreground mb-1">追蹤者</p>
                <p className="font-serif text-2xl text-foreground/85 leading-none">{formatFollowers(resume.followerCount)}</p>
              </div>
            )}
            <div className="px-6">
              <p className="text-[0.5rem] uppercase tracking-[0.4em] text-muted-foreground mb-1">合作商案</p>
              <p className="font-serif text-2xl text-foreground/85 leading-none">{resume.platformStats.activeProjects}</p>
            </div>
            <div className="px-6">
              <p className="text-[0.5rem] uppercase tracking-[0.4em] text-muted-foreground mb-1">成交數</p>
              <p className="font-serif text-2xl text-foreground/85 leading-none">{resume.platformStats.totalSales}</p>
            </div>
            <div className="pl-6">
              <p className="text-[0.5rem] uppercase tracking-[0.4em] text-muted-foreground mb-1">轉換率</p>
              <p className="font-serif text-2xl text-foreground/85 leading-none">{resume.platformStats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* View */}
        <Link
          href={`/kols/${username}`}
          className="group relative overflow-hidden rounded-xl border border-foreground/[0.09] bg-white px-6 py-7 transition-all duration-300 hover:border-foreground/20 hover:bg-stone-50"
        >
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/[0.04] text-muted-foreground transition-colors duration-200 group-hover:border-foreground/20 group-hover:text-foreground">
            <Eye className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium leading-snug text-foreground">查看公開頁面</p>
          <p className="mt-2 text-[0.72rem] leading-relaxed text-muted-foreground">
            以訪客視角預覽你的公開履歷
          </p>
          <div className="mt-6 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground/50 transition-colors duration-200 group-hover:text-foreground/50">
            <span>前往</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </div>
        </Link>

        {/* Edit */}
        <Link
          href="/kol/resume/edit"
          className="group relative overflow-hidden rounded-xl border border-foreground bg-foreground px-6 py-7 transition-all duration-300 hover:bg-foreground/90"
        >
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg border border-background/20 bg-background/[0.07] text-background/60 transition-colors duration-200 group-hover:bg-background/[0.12] group-hover:text-background/80">
            <Pencil className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium leading-snug text-background">編輯履歷</p>
          <p className="mt-2 text-[0.72rem] leading-relaxed text-background/50">
            更新個人介紹、社群連結與作品說明
          </p>
          <div className="mt-6 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-background/30 transition-colors duration-200 group-hover:text-background/50">
            <span>前往</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </div>
        </Link>

      </div>

    </div>
  )
}
