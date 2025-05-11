import type React from "react"
import type { Metadata } from "next"
import { Kanit } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
})

export const metadata: Metadata = {
  title: "ประกาศผลการสมัคร YWC20",
  description: "ประกาศผลการสมัคร Young Webmaster Camp ครั้งที่ 20",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/ywc-logo.jpg" as="image" />
      </head>
      <body className={`${kanit.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
