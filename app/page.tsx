"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Lock } from "lucide-react"
import Image from "next/image"
import ResultCard from "@/components/result-card"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function Home() {
  const [searchName, setSearchName] = useState("")
  const [loading, setLoading] = useState(false)
  const [candidate, setCandidate] = useState<{
    firstName: string
    lastName: string
    interviewRefNo?: string
    major: string
    majorName?: string
    passed: boolean
    status?: "not_started" | "qualified" | "not_qualified"
    interviewTime?: string
    interviewFormat?: "online" | "onsite"
  } | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const searchCandidate = async () => {
    if (!searchName) {
      toast({
        title: "กรุณากรอกชื่อและนามสกุล",
        variant: "destructive",
      })
      return
    }

    // Check if the input contains at least a first name and last name
    const nameParts = searchName.trim().split(" ")
    if (nameParts.length < 2) {
      toast({
        title: "กรุณากรอกทั้งชื่อและนามสกุล (เช่น Nicole Glover)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError("")
    setCandidate(null)

    try {
      const response = await fetch("https://api.ywc20.ywc.in.th/homework/candidates", {
        headers: {
          "x-reference-id": "PG30",
        },
      })

      if (!response.ok) {
        throw new Error(response.status === 404 ? "ไม่พบข้อมูลผู้สมัคร" : "เกิดข้อผิดพลาดในการค้นหา")
      }

      const data = await response.json()

      // Search by full name (exact match of "firstName lastName")
      const [firstName, ...lastNameParts] = nameParts
      const lastName = lastNameParts.join(" ")

      // Find candidate in all tracks
      const tracks = ["design", "content", "programming", "marketing"]
      let foundCandidate = null

      for (const track of tracks) {
        if (data[track] && Array.isArray(data[track])) {
          const found = data[track].find(
            (c) =>
              c.firstName.toLowerCase() === firstName.toLowerCase() &&
              c.lastName.toLowerCase() === lastName.toLowerCase(),
          )
          if (found) {
            // Get candidate status from localStorage
            const savedStatuses = localStorage.getItem("ywc20_candidate_statuses")
            let status = "not_started"
            let interviewTime = undefined
            let interviewFormat = undefined

            if (savedStatuses) {
              const statuses = JSON.parse(savedStatuses)
              if (statuses[found.interviewRefNo]) {
                status = statuses[found.interviewRefNo].status
              }
            }

            // Get interview time and format from assignments
            const savedAssignments = localStorage.getItem(`ywc20_assignments_${new Date().toISOString().split("T")[0]}`)
            if (savedAssignments) {
              const assignments = JSON.parse(savedAssignments)
              const assignment = assignments.find((a) => a.candidateId === found.interviewRefNo)

              if (assignment) {
                // Get time slot details
                const savedSlots = localStorage.getItem(`ywc20_timeslots_${new Date().toISOString().split("T")[0]}`)
                if (savedSlots) {
                  const slots = JSON.parse(savedSlots)
                  const slot = slots.find((s) => s.id === assignment.slotId)
                  if (slot) {
                    interviewTime = `${slot.startTime} - ${slot.endTime}`
                    interviewFormat = assignment.interviewFormat
                  }
                }
              }
            }

            foundCandidate = {
              ...found,
              majorName: getMajorName(found.major),
              passed: true, // If found in the API, they passed
              status,
              interviewTime,
              interviewFormat,
            }
            break
          }
        }
      }

      if (foundCandidate) {
        setCandidate(foundCandidate)
      } else {
        // If not found, we'll assume they didn't pass but still show a result
        setCandidate({
          firstName,
          lastName,
          major: "",
          passed: false,
        })
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get Thai major name
  const getMajorName = (major: string) => {
    switch (major) {
      case "web_design":
        return "Web Design"
      case "web_content":
        return "Web Content"
      case "web_programming":
        return "Web Programming"
      case "web_marketing":
        return "Web Marketing"
      default:
        return major
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchCandidate()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 bg-gradient-to-b from-red-950 to-black text-white">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-8 mt-8 text-center">
          <Image
            src="/ywc-logo.jpg"
            alt="YWC Logo"
            width={160}
            height={96}
            className="mx-auto mb-6 rounded-lg"
            priority
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">ประกาศผลคัดเลือกเข้าสัมภาษณ์</h1>
          <h2 className="text-xl md:text-2xl font-semibold mb-6">Young Webmaster Camp ครั้งที่ 20</h2>
        </div>

        <Card className="w-full max-w-md bg-black border-red-900 mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <label htmlFor="searchName" className="text-sm font-medium text-white">
                ค้นหาด้วยชื่อและนามสกุล
              </label>
              <div className="flex space-x-2">
                <Input
                  id="searchName"
                  placeholder="เช่น Nicole Glover"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-red-900/30 border-red-800 text-white"
                />
                <Button
                  onClick={searchCandidate}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white"
                >
                  {loading ? (
                    "กำลังค้นหา..."
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      ค้นหา
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-300">กรุณากรอกชื่อและนามสกุลให้ถูกต้อง เช่น Nicole Glover</p>
            </div>
          </CardContent>
        </Card>

        {candidate && <ResultCard candidate={candidate} />}

        {error && !candidate && (
          <div className="w-full max-w-md bg-black border border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-300">{error}</p>
            <p className="text-sm mt-2">กรุณาตรวจสอบชื่อและนามสกุลอีกครั้ง (ต้องตรงกับที่ลงทะเบียนไว้)</p>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-400">
          <p>© 2025 Young Webmaster Camp.</p>
          <p className="mt-1">
            Made by{" "}
            <a
              href="https://github.com/lolymoly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:underline"
            >
              Teetat Wisanuyotin
            </a>
          </p>
          <div className="mt-2">
            <Link href="/admin-login" className="text-red-400 hover:underline flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" />
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
