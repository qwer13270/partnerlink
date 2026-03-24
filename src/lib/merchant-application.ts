export type NormalizedMerchantApplicationInput = {
  companyName: string
  contactName: string
  phone: string
  city: string | null
  projectCount: string | null
}

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toOptionalString(value: unknown) {
  const normalized = toTrimmedString(value)
  return normalized.length > 0 ? normalized : null
}

export function normalizeMerchantApplicationInput(body: Record<string, unknown>) {
  return {
    companyName: toTrimmedString(body.companyName),
    contactName: toTrimmedString(body.contactName),
    phone: toTrimmedString(body.phone),
    city: toOptionalString(body.city),
    projectCount: toOptionalString(body.projectCount),
  } satisfies NormalizedMerchantApplicationInput
}
