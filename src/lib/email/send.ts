import type { ReactElement } from 'react'
import { getEmailFrom, getResendClient } from '@/lib/email/resend'

type SendEmailArgs = {
  to: string
  subject: string
  react: ReactElement
  tags?: Array<{ name: string; value: string }>
}

type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

export async function sendEmail({ to, subject, react, tags }: SendEmailArgs): Promise<SendEmailResult> {
  try {
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to,
      subject,
      react,
      tags,
    })

    if (error || !data) {
      const message = error?.message ?? 'Unknown Resend error'
      console.error('[email] send failed:', message)
      return { ok: false, error: message }
    }

    return { ok: true, id: data.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[email] send threw:', message)
    return { ok: false, error: message }
  }
}
