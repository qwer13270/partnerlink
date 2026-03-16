import zhTW from '@/i18n/messages/zh-TW.json'

export const strings = zhTW

/** Replace `{key}` placeholders in a template string. */
export function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    String(params[key] ?? `{${key}}`),
  )
}

export default strings
