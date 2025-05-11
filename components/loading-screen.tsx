"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  children: React.ReactNode
}

export default function LoadingScreen({ children }: LoadingScreenProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set a minimum loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-red-950 to-black z-50">
        <div className="w-[120px] h-[120px] rounded-lg mb-6 bg-black flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-[url('/ywc-logo.jpg')] bg-cover bg-center" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="mt-4 text-white">กำลังโหลด...</p>
      </div>
    )
  }

  return <>{children}</>
}
