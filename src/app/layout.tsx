import type { Metadata } from "next"
import { DM_Serif_Display, DM_Sans, Noto_Serif_TC, Noto_Sans_TC } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from '@/components/ui/sonner'
import { ConditionalHeader, ConditionalFooter } from '@/components/layout/ConditionalHeader'
import "./globals.css"

// Editorial serif for headings - strong, architectural
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

// Clean geometric sans-serif for body
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

// Chinese serif for headings
const notoSerifTC = Noto_Serif_TC({
  variable: "--font-serif-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

// Chinese sans-serif for body
const notoSansTC = Noto_Sans_TC({
  variable: "--font-sans-tc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "PartnerLink 夥伴 | Premium Brand Affiliate Platform",
  description: "Taiwan's premier real estate affiliate marketing platform — connecting merchants with influential KOLs",
  icons: {
    icon: "/favicon.svg",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${dmSerifDisplay.variable} ${dmSans.variable} ${notoSerifTC.variable} ${notoSansTC.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <ConditionalHeader />
            <main className="flex-1">
              {children}
            </main>
            <ConditionalFooter />
          </div>
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
