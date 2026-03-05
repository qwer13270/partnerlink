import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getSupabaseAdminKey,
  getSupabasePublishableKey,
  getSupabaseUrl,
} from '@/lib/supabase/env'

let adminClient: SupabaseClient | null = null
let tokenVerifierClient: SupabaseClient | null = null

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient

  adminClient = createClient(
    getSupabaseUrl(),
    getSupabaseAdminKey(),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )

  return adminClient
}

export function getSupabaseTokenVerifierClient() {
  if (tokenVerifierClient) return tokenVerifierClient

  tokenVerifierClient = createClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )

  return tokenVerifierClient
}
