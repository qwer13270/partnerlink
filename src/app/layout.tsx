import type { Metadata, Viewport } from "next"
import { DM_Serif_Display, DM_Sans, Noto_Serif_TC, Noto_Sans_TC, Instrument_Serif, Barlow, JetBrains_Mono } from "next/font/google"
import { Toaster } from '@/components/ui/sonner'
import { ConditionalHeader } from '@/components/layout/ConditionalHeader'
import "./globals.css"

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-serif-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

const notoSansTC = Noto_Sans_TC({
  variable: "--font-sans-tc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
})

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "PartnerLink 夥伴 | Premium Brand Affiliate Platform",
  description: "Taiwan's premier real estate affiliate marketing platform — connecting merchants with influential KOLs",
  icons: {
    icon: "/favicon.svg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${dmSerifDisplay.variable} ${dmSans.variable} ${notoSerifTC.variable} ${notoSansTC.variable} ${instrumentSerif.variable} ${barlow.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <ConditionalHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
