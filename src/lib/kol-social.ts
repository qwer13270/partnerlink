import type { SocialLinks } from '@/data/mock-resume'

export function toFullUrl(platform: string, value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  const handle = value.replace(/^@/, '')
  switch (platform) {
    case 'instagram': return `https://instagram.com/${handle}`
    case 'tiktok':    return `https://tiktok.com/@${handle}`
    case 'facebook':  return `https://facebook.com/${handle}`
    case 'youtube':   return `https://youtube.com/@${handle}`
    default:          return `https://${value}`
  }
}

export function platformAccountsToSocialLinks(accounts: Record<string, string>): SocialLinks {
  const links: SocialLinks = {}
  for (const [platform, value] of Object.entries(accounts)) {
    if (!value) continue
    switch (platform.toLowerCase()) {
      case 'instagram': links.instagram = toFullUrl('instagram', value); break
      case 'tiktok':    links.tiktok    = toFullUrl('tiktok',    value); break
      case 'facebook':  links.facebook  = toFullUrl('facebook',  value); break
      case 'youtube':   links.youtube   = toFullUrl('youtube',   value); break
      case 'website':   links.website   = toFullUrl('website',   value); break
    }
  }
  return links
}
