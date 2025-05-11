import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "YWC20 Admin Panel",
  description: "ระบบจัดการสล็อตเวลาสัมภาษณ์ Young Webmaster Camp ครั้งที่ 20",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
