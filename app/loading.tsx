import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-gray-900 to-black text-white">
      <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      <p className="mt-4 text-lg">กำลังโหลด...</p>
    </div>
  )
}
