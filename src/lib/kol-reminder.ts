export const REMINDER_STAGES = [3, 7, 14] as const
export type ReminderStage = (typeof REMINDER_STAGES)[number]

export type ApprovedKolRow = {
  user_id: string
  email: string | null
  full_name: string | null
  reviewed_at: string | null
  profile_photo_path: string | null
}

export type MediaAssetRow = {
  user_id: string
  media_type: 'image' | 'video'
  storage_path: string | null
}

export type ReminderLogRow = {
  user_id: string
  reminder_stage: number
}

export type ReminderRecipient = {
  user_id: string
  email: string
  full_name: string
  stage: ReminderStage
  missingPhoto: boolean
  missingPortfolio: boolean
}

type SelectArgs = {
  now: Date
  approvedKols: ApprovedKolRow[]
  mediaAssets: MediaAssetRow[]
  sentLog: ReminderLogRow[]
}

// Days elapsed between two UTC instants, floored. Whole-day granularity is
// enough for "3/7/14 days since approval" — admins don't approve at a precise
// time-of-day and we only need to catch each stage once per daily sweep.
function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function isReminderStage(n: number): n is ReminderStage {
  return n === 3 || n === 7 || n === 14
}

export function selectKolsNeedingReminder({
  now,
  approvedKols,
  mediaAssets,
  sentLog,
}: SelectArgs): ReminderRecipient[] {
  const assetCountByUser = new Map<string, number>()
  for (const asset of mediaAssets) {
    if (!asset.storage_path) continue
    assetCountByUser.set(asset.user_id, (assetCountByUser.get(asset.user_id) ?? 0) + 1)
  }

  const sentSet = new Set<string>()
  for (const row of sentLog) {
    sentSet.add(`${row.user_id}:${row.reminder_stage}`)
  }

  const recipients: ReminderRecipient[] = []

  for (const kol of approvedKols) {
    if (!kol.reviewed_at || !kol.email) continue

    const approvedAt = new Date(kol.reviewed_at)
    if (Number.isNaN(approvedAt.getTime())) continue

    const days = daysBetween(approvedAt, now)
    if (!isReminderStage(days)) continue

    const missingPhoto = !kol.profile_photo_path
    const missingPortfolio = (assetCountByUser.get(kol.user_id) ?? 0) === 0
    if (!missingPhoto && !missingPortfolio) continue

    if (sentSet.has(`${kol.user_id}:${days}`)) continue

    recipients.push({
      user_id: kol.user_id,
      email: kol.email,
      full_name: kol.full_name ?? '夥伴',
      stage: days,
      missingPhoto,
      missingPortfolio,
    })
  }

  return recipients
}
