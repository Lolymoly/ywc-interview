"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Lock, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // ตรวจสอบ credentials
    if (username === "master" && password === "1234") {
      // สร้าง Basic Auth token และเก็บไว้ใน localStorage
      const token = btoa(`${username}:${password}`)
      localStorage.setItem("ywc20_admin_token", token)

      // แสดง toast และ redirect ไปที่หน้า admin
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "กำลังนำคุณไปยังหน้าจัดการระบบ",
      })

      setTimeout(() => {
        router.push("/admin")
      }, 1000)
    } else {
      // แสดง toast error
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-950 to-black text-white p-4">
      <div className="w-full max-w-md">
        <Card className="bg-black border-red-900">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/ywc-logo.jpg" alt="YWC Logo" width={80} height={80} className="rounded" priority />
            </div>
            <CardTitle className="text-2xl">เข้าสู่ระบบ Admin</CardTitle>
            <CardDescription className="text-gray-400">
              ระบบจัดการสล็อตเวลาสัมภาษณ์ Young Webmaster Camp ครั้งที่ 20
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="ชื่อผู้ใช้"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-red-900/30 border-red-800"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-red-900/30 border-red-800"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
                disabled={isLoading}
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm text-red-400 hover:underline">
              กลับไปยังหน้าหลัก
            </Link>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
    </main>
  )
}
