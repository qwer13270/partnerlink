import type { Metadata } from "next"
import { DM_Serif_Display, DM_Sans, Noto_Serif_TC, Noto_Sans_TC } from "next/font/google"
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
  title: "HomeKey 房客 | Premium Real Estate Affiliate Platform",
  description: "Taiwan's premier real estate affiliate marketing platform — connecting developers with influential KOLs",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${dmSerifDisplay.variable} ${dmSans.variable} ${notoSerifTC.variable} ${notoSansTC.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
