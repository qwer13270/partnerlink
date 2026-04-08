export type MerchantType = 'property' | 'shop'
export const MERCHANT_TYPES: MerchantType[] = ['property', 'shop']

/** Returns the Chinese display label for a merchant/project type value. */
export function typeLabel(type: string): string {
  return type === 'shop' ? '商案' : '建案'
}

export type NormalizedMerchantApplicationInput = {
  companyName: string
  contactName: string
  phone: string
  city: string | null
  projectCount: string | null
  merchantType: MerchantType | null
}

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toOptionalString(value: unknown) {
  const normalized = toTrimmedString(value)
  return normalized.length > 0 ? normalized : null
}

export function normalizeMerchantApplicationInput(body: Record<string, unknown>) {
  const merchantType = MERCHANT_TYPES.includes(body.merchantType as MerchantType)
    ? (body.merchantType as MerchantType)
    : null
  return {
    companyName: toTrimmedString(body.companyName),
    contactName: toTrimmedString(body.contactName),
    phone: toTrimmedString(body.phone),
    city: toOptionalString(body.city),
    projectCount: toOptionalString(body.projectCount),
    merchantType,
  } satisfies NormalizedMerchantApplicationInput
}
