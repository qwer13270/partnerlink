import type { ReactNode } from 'react'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

type EmailLayoutProps = {
  preview: string
  children: ReactNode
}

const fontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif'

const styles = {
  body: {
    backgroundColor: '#0b0b0d',
    margin: 0,
    padding: '32px 0',
    fontFamily: fontStack,
    color: '#e9e9ec',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '40px 32px',
    backgroundColor: '#141418',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  brand: {
    fontSize: '18px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: '#ffffff',
    margin: 0,
  },
  brandSub: {
    fontSize: '12px',
    color: '#8a8a93',
    margin: '4px 0 0',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.08)',
    margin: '24px 0',
  },
  footer: {
    fontSize: '12px',
    color: '#7a7a82',
    lineHeight: '18px',
    margin: '24px 0 0',
  },
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="zh-Hant">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section>
            <Text style={styles.brand}>PartnerLink 夥伴</Text>
            <Text style={styles.brandSub}>Taiwan KOL × 商家合作平台</Text>
          </Section>
          <Hr style={styles.divider} />
          {children}
          <Hr style={styles.divider} />
          <Text style={styles.footer}>
            這是一封來自 PartnerLink 的系統通知。如有任何問題，請直接回覆此信件與我們聯繫。
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const emailStyles = {
  heading: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#ffffff',
    margin: '0 0 16px',
    lineHeight: '30px',
  },
  paragraph: {
    fontSize: '15px',
    color: '#d4d4d8',
    lineHeight: '24px',
    margin: '0 0 16px',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#ffffff',
    color: '#0b0b0d',
    padding: '12px 22px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    margin: '8px 0 16px',
  },
  subtle: {
    fontSize: '13px',
    color: '#9a9aa3',
    lineHeight: '20px',
    margin: '0 0 8px',
  },
}
