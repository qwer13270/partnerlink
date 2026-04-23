import { Resend } from 'resend'

let client: Resend | null = null

export function getResendClient() {
  if (client) return client

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }

  client = new Resend(apiKey)
  return client
}

export function getEmailFrom() {
  const from = process.env.EMAIL_FROM
  if (!from) {
    throw new Error('EMAIL_FROM is not set')
  }
  return from
}

export function getAppUrl() {
  return process.env.APP_URL ?? 'http://localhost:3000'
}
