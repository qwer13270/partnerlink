import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

const BUCKETS: { bucket: string; prefix: (userId: string) => string }[] = [
  { bucket: 'kol-media',      prefix: (id) => `kol/${id}` },
  { bucket: 'property-media', prefix: (id) => `properties/${id}` },
]

async function listAllFiles(
  admin: SupabaseClient,
  bucket: string,
  rootPrefix: string,
): Promise<string[]> {
  const out: string[] = []
  const stack: string[] = [rootPrefix]

  while (stack.length > 0) {
    const prefix = stack.pop()!
    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefix, { limit: 1000 })

    if (error) {
      // Supabase returns an error when the folder doesn't exist — treat as empty.
      if (/not found/i.test(error.message)) continue
      throw new Error(`list ${bucket}/${prefix}: ${error.message}`)
    }

    for (const item of data ?? []) {
      const full = prefix ? `${prefix}/${item.name}` : item.name
      // Folders have id === null; files have an id.
      if (item.id === null) {
        stack.push(full)
      } else {
        out.push(full)
      }
    }
  }

  return out
}

export async function deleteUserWithStorage(
  userId: string,
): Promise<{ removedFiles: Record<string, number> }> {
  const admin = getSupabaseAdminClient()
  const removedFiles: Record<string, number> = {}

  for (const { bucket, prefix } of BUCKETS) {
    const paths = await listAllFiles(admin, bucket, prefix(userId))
    removedFiles[bucket] = 0
    if (paths.length === 0) continue

    for (let i = 0; i < paths.length; i += 1000) {
      const batch = paths.slice(i, i + 1000)
      const { error: removeError } = await admin.storage.from(bucket).remove(batch)
      if (removeError) throw new Error(`remove ${bucket}: ${removeError.message}`)
      removedFiles[bucket] += batch.length
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) throw new Error(`deleteUser: ${deleteError.message}`)

  return { removedFiles }
}
