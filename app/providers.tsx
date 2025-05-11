"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import LoadingScreen from "@/components/loading-screen"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LoadingScreen>{children}</LoadingScreen>
    </ThemeProvider>
  )
}
