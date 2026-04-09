import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { AudienceClient } from './_ui'

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = getSupabaseAdminClient()
  const { data: project } = await admin
    .from('projects')
    .select('id, name, type')
    .eq('id', projectId)
    .eq('merchant_user_id', user.id)
    .maybeSingle()

  if (!project || project.type !== 'property') redirect(`/merchant/projects/${projectId}/customers`)

  return (
    <AudienceClient
      projectId={projectId}
      projectName={project.name as string}
    />
  )
}
