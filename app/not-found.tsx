import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-gray-900 to-black text-white">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">ไม่พบหน้าที่คุณกำลังค้นหา</p>
      <Link href="/">
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
          <Home className="mr-2 h-4 w-4" />
          กลับหน้าหลัก
        </Button>
      </Link>
    </div>
  )
}
