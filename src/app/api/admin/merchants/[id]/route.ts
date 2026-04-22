import { NextRequest, NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/server/api-auth'
import { deleteUserWithStorage } from '@/lib/server/delete-user'

// DELETE /api/admin/merchants/[id]
// [id] is the auth.users.id of the merchant (user_id), not merchant_profiles.id.
// Cleans kol-media + property-media storage, then cascades the DB delete.
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const { id } = await ctx.params
  if (!id) return NextResponse.json({ error: 'Missing user id.' }, { status: 400 })
  if (id === auth.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account.' }, { status: 400 })
  }

  try {
    const result = await deleteUserWithStorage(id)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed.'
    console.error('[api/admin/merchants/delete] step:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
