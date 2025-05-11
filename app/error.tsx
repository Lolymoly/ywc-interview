"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-gray-900 to-black text-white">
      <h1 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h1>
      <p className="text-lg mb-8">เกิดข้อผิดพลาดในการแสดงผลหน้านี้ กรุณาลองใหม่อีกครั้ง</p>
      <Button onClick={reset} className="bg-yellow-500 hover:bg-yellow-600 text-black">
        <RefreshCw className="mr-2 h-4 w-4" />
        ลองใหม่
      </Button>
    </div>
  )
}
