"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Shuffle, Save, Clock, Users, ArrowLeft, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import TimeSlotGrid from "@/components/admin/time-slot-grid"
import CandidateList from "@/components/admin/candidate-list"
import { generateTimeSlots, getRandomAvailableSlot, isSlotAvailableForTrack } from "@/lib/time-utils"
import type { Candidate, TimeSlot, TimeSlotAssignment } from "@/types/admin"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("design")
  const [candidates, setCandidates] = useState<Record<string, Candidate[]>>({
    design: [],
    content: [],
    programming: [],
    marketing: [],
  })
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [assignments, setAssignments] = useState<TimeSlotAssignment[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, { note?: string; status: string }>>({})

  // Track mapping for display
  const trackMapping: Record<string, string> = {
    design: "Design",
    content: "Content",
    programming: "Programming",
    marketing: "Marketing",
  }

  // Initialize time slots and load candidates
  useEffect(() => {
    // Generate time slots
    const slots = generateTimeSlots()

    // Load saved time slots from localStorage
    const savedSlots = localStorage.getItem(`ywc20_timeslots_${selectedDate}`)
    if (savedSlots) {
      setTimeSlots(JSON.parse(savedSlots))
    } else {
      setTimeSlots(slots)
    }

    // Load assignments from localStorage
    const savedAssignments = localStorage.getItem(`ywc20_assignments_${selectedDate}`)
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments))
    } else {
      setAssignments([])
    }

    // Load candidate statuses from localStorage
    const savedStatuses = localStorage.getItem(`ywc20_candidate_statuses`)
    if (savedStatuses) {
      setCandidateStatuses(JSON.parse(savedStatuses))
    }

    // Load candidates data
    fetchCandidates()
  }, [selectedDate])

  const fetchCandidates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("https://api.ywc20.ywc.in.th/homework/candidates", {
        headers: {
          "x-reference-id": "PG30",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch candidates")
      }

      const data = await response.json()

      // Transform API data to our format
      const transformedCandidates: Record<string, Candidate[]> = {
        design: [],
        content: [],
        programming: [],
        marketing: [],
      }

      // Process each track
      Object.keys(data).forEach((track) => {
        if (Array.isArray(data[track])) {
          transformedCandidates[track] = data[track].map((candidate: any) => {
            const candidateId = candidate.interviewRefNo
            const savedStatus = candidateStatuses[candidateId]

            return {
              id: candidateId,
              firstName: candidate.firstName,
              lastName: candidate.lastName,
              major: candidate.major,
              timeSlot: null,
              interviewFormat: "onsite",
              note: savedStatus?.note || "",
              status: savedStatus?.status || "not_started",
            }
          })
        }
      })

      // Update candidates with their assigned time slots from assignments
      if (assignments.length > 0) {
        Object.keys(transformedCandidates).forEach((track) => {
          transformedCandidates[track] = transformedCandidates[track].map((candidate) => {
            const assignment = assignments.find((a) => a.candidateId === candidate.id && a.track === track)
            if (assignment) {
              return {
                ...candidate,
                timeSlot: assignment.slotId,
                interviewFormat: assignment.interviewFormat,
              }
            }
            return candidate
          })
        })
      }

      setCandidates(transformedCandidates)
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast({
        title: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้สมัคร",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleAssignTimeSlot = (slotId: string) => {
    if (!selectedCandidate) return

    // Check if the slot is already assigned for this track
    const isSlotTaken = !isSlotAvailableForTrack(slotId, assignments, activeTab)

    if (isSlotTaken) {
      toast({
        title: `สล็อตเวลานี้ถูกจองแล้วสำหรับสาขา ${trackMapping[activeTab]}`,
        description: "กรุณาเลือกสล็อตเวลาอื่น",
        variant: "destructive",
      })
      return
    }

    // Remove any existing assignment for this candidate in this track
    const updatedAssignments = assignments.filter(
      (a) => !(a.candidateId === selectedCandidate.id && a.track === activeTab),
    )

    // Add new assignment
    updatedAssignments.push({
      slotId,
      candidateId: selectedCandidate.id,
      track: activeTab,
      interviewFormat: selectedCandidate.interviewFormat,
    })

    setAssignments(updatedAssignments)
    saveAssignments(updatedAssignments)

    // Update candidate in state
    const updatedCandidates = { ...candidates }
    updatedCandidates[activeTab] = updatedCandidates[activeTab].map((c) => {
      if (c.id === selectedCandidate.id) {
        return { ...c, timeSlot: slotId }
      }
      return c
    })

    setCandidates(updatedCandidates)

    toast({
      title: "จัดสล็อตเวลาสำเร็จ",
      description: `จัดสล็อตเวลาให้ ${selectedCandidate.firstName} ${selectedCandidate.lastName} เรียบร้อยแล้ว`,
    })

    setSelectedCandidate(null)
  }

  const handleChangeInterviewFormat = (candidateId: string, format: "online" | "onsite") => {
    // Update assignment
    const updatedAssignments = assignments.map((a) => {
      if (a.candidateId === candidateId && a.track === activeTab) {
        return { ...a, interviewFormat: format }
      }
      return a
    })

    setAssignments(updatedAssignments)
    saveAssignments(updatedAssignments)

    // Update candidate in state
    const updatedCandidates = { ...candidates }
    updatedCandidates[activeTab] = updatedCandidates[activeTab].map((c) => {
      if (c.id === candidateId) {
        return { ...c, interviewFormat: format }
      }
      return c
    })

    setCandidates(updatedCandidates)
  }

  // Memoize the update candidate function to prevent unnecessary re-renders
  const handleUpdateCandidate = useCallback(
    (candidateId: string, updates: Partial<Candidate>) => {
      // Update candidate in state
      setCandidates((prevCandidates) => {
        const updatedCandidates = { ...prevCandidates }
        let updatedCandidate: Candidate | null = null

        Object.keys(updatedCandidates).forEach((track) => {
          updatedCandidates[track] = updatedCandidates[track].map((c) => {
            if (c.id === candidateId) {
              updatedCandidate = { ...c, ...updates }
              return updatedCandidate
            }
            return c
          })
        })

        // Update candidate statuses in localStorage with debounce
        if (updatedCandidate) {
          setCandidateStatuses((prevStatuses) => {
            const updatedStatuses = { ...prevStatuses }
            updatedStatuses[candidateId] = {
              note: updatedCandidate?.note,
              status: updatedCandidate?.status || "not_started",
            }

            // Only update localStorage when status changes, not on every note change
            // (note changes are handled by the debounce in the CandidateList component)
            if (updates.status) {
              localStorage.setItem(`ywc20_candidate_statuses`, JSON.stringify(updatedStatuses))
            }

            return updatedStatuses
          })
        }

        return updatedCandidates
      })

      // Only show toast for status changes, not for note changes
      if (updates.status) {
        toast({
          title: "อัพเดทสถานะผู้สมัครสำเร็จ",
        })
      }
    },
    [toast],
  )

  const handleRandomAssignForCandidate = (candidate: Candidate) => {
    // Get a random available slot for this track
    const availableSlot = getRandomAvailableSlot(timeSlots, assignments, activeTab)

    if (!availableSlot) {
      toast({
        title: "ไม่มีสล็อตเวลาว่างสำหรับสาขานี้",
        variant: "destructive",
      })
      return
    }

    // Remove any existing assignment for this candidate in this track
    const updatedAssignments = assignments.filter((a) => !(a.candidateId === candidate.id && a.track === activeTab))

    // Add new assignment
    updatedAssignments.push({
      slotId: availableSlot.id,
      candidateId: candidate.id,
      track: activeTab,
      interviewFormat: candidate.interviewFormat,
    })

    setAssignments(updatedAssignments)
    saveAssignments(updatedAssignments)

    // Update candidate in state
    const updatedCandidates = { ...candidates }
    updatedCandidates[activeTab] = updatedCandidates[activeTab].map((c) => {
      if (c.id === candidate.id) {
        return { ...c, timeSlot: availableSlot.id }
      }
      return c
    })

    setCandidates(updatedCandidates)

    toast({
      title: "จัดสล็อตเวลาอัตโนมัติสำเร็จ",
      description: `จัดสล็อตเวลาให้ ${candidate.firstName} ${candidate.lastName} เรียบร้อยแล้ว`,
    })
  }

  const handleRandomAssign = () => {
    const unassignedCandidates = candidates[activeTab].filter((c) => !c.timeSlot)

    if (unassignedCandidates.length === 0) {
      toast({
        title: "ไม่มีผู้สมัครที่ยังไม่ได้รับการจัดสล็อตเวลา",
        variant: "destructive",
      })
      return
    }

    let successCount = 0
    const updatedAssignments = [...assignments]
    const updatedCandidates = { ...candidates }

    // Assign random time slots to unassigned candidates
    unassignedCandidates.forEach((candidate) => {
      const availableSlot = getRandomAvailableSlot(timeSlots, updatedAssignments, activeTab)

      if (availableSlot) {
        // Add new assignment
        updatedAssignments.push({
          slotId: availableSlot.id,
          candidateId: candidate.id,
          track: activeTab,
          interviewFormat: candidate.interviewFormat,
        })

        // Update candidate in state
        updatedCandidates[activeTab] = updatedCandidates[activeTab].map((c) => {
          if (c.id === candidate.id) {
            return { ...c, timeSlot: availableSlot.id }
          }
          return c
        })

        successCount++
      }
    })

    if (successCount > 0) {
      setAssignments(updatedAssignments)
      setCandidates(updatedCandidates)
      saveAssignments(updatedAssignments)

      toast({
        title: "จัดสล็อตเวลาอัตโนมัติสำเร็จ",
        description: `ระบบได้จัดสล็อตเวลาให้ผู้สมัคร ${successCount} คนเรียบร้อยแล้ว`,
      })
    } else {
      toast({
        title: "ไม่สามารถจัดสล็อตเวลาได้",
        description: "ไม่มีสล็อตเวลาว่างสำหรับสาขานี้",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAssignment = (candidateId: string) => {
    // Remove assignment
    const updatedAssignments = assignments.filter((a) => !(a.candidateId === candidateId && a.track === activeTab))

    setAssignments(updatedAssignments)
    saveAssignments(updatedAssignments)

    // Update candidate in state
    const updatedCandidates = { ...candidates }
    updatedCandidates[activeTab] = updatedCandidates[activeTab].map((c) => {
      if (c.id === candidateId) {
        return { ...c, timeSlot: null }
      }
      return c
    })

    setCandidates(updatedCandidates)

    toast({
      title: "ยกเลิกการจัดสล็อตเวลาสำเร็จ",
    })
  }

  const saveAssignments = (assignmentsData: TimeSlotAssignment[]) => {
    // Save to localStorage
    localStorage.setItem(`ywc20_assignments_${selectedDate}`, JSON.stringify(assignmentsData))
  }

  const handleSaveTimeSlots = () => {
    localStorage.setItem(`ywc20_timeslots_${selectedDate}`, JSON.stringify(timeSlots))
    localStorage.setItem(`ywc20_assignments_${selectedDate}`, JSON.stringify(assignments))
    localStorage.setItem(`ywc20_candidate_statuses`, JSON.stringify(candidateStatuses))

    toast({
      title: "บันทึกข้อมูลสำเร็จ",
    })
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const handleLogout = () => {
    // ลบ token จาก localStorage
    localStorage.removeItem("ywc20_admin_token")

    // แสดง toast และ redirect ไปที่หน้า login
    toast({
      title: "ออกจากระบบสำเร็จ",
    })

    router.push("/admin-login")
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-red-950 to-black text-white">
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="icon"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Image src="/ywc-logo.jpg" alt="YWC Logo" width={40} height={40} className="rounded" priority />
              <h1 className="text-xl font-bold">ระบบจัดการสล็อตเวลาสัมภาษณ์ YWC20</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="date-select">วันที่:</Label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-red-900/30 border border-red-800 rounded px-3 py-1 text-sm flex-1 sm:flex-none"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleSaveTimeSlots}
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white flex-1 sm:flex-none"
              >
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>

        {/* เปลี่ยนจาก grid เป็น flex-col */}
        <div className="flex flex-col gap-6">
          {/* ตารางสล็อตเวลาสัมภาษณ์ */}
          <Card className="bg-black border-red-900">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle>ตารางสล็อตเวลาสัมภาษณ์</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-red-900/30 text-white border-red-800">
                    <Clock className="h-3 w-3 mr-1" />
                    สล็อตละ 15 นาที
                  </Badge>
                  <Badge variant="outline" className="bg-red-900/30 text-white border-red-800">
                    <Users className="h-3 w-3 mr-1" />1 คนต่อสาขาต่อสล็อต
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TimeSlotGrid
                timeSlots={timeSlots}
                assignments={assignments}
                activeTrack={activeTab}
                onSelectTimeSlot={handleAssignTimeSlot}
                selectedCandidate={selectedCandidate}
              />
            </CardContent>
          </Card>

          {/* รายชื่อผู้เข้าสัมภาษณ์ */}
          <Card className="bg-black border-red-900">
            <CardHeader className="pb-3">
              <CardTitle>รายชื่อผู้เข้าสัมภาษณ์</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="block sm:hidden mb-4">
                <Select
                  value={activeTab}
                  onValueChange={(value) => {
                    setActiveTab(value)
                    setSelectedCandidate(null) // Reset selected candidate when changing tab
                  }}
                >
                  <SelectTrigger className="w-full bg-red-900/30 border-red-800">
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-red-800">
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden sm:block">
                <TabsList className="grid grid-cols-4 bg-red-950 mb-4">
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="programming">Programming</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleRandomAssign}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  จัดสล็อตอัตโนมัติ
                </Button>
              </div>

              {/* แสดงรายชื่อผู้สมัครตาม activeTab */}
              {activeTab === "design" && (
                <CandidateList
                  candidates={candidates.design}
                  onSelectCandidate={handleSelectCandidate}
                  selectedCandidate={selectedCandidate}
                  onChangeFormat={handleChangeInterviewFormat}
                  onRandomAssign={handleRandomAssignForCandidate}
                  onRemoveAssignment={handleRemoveAssignment}
                  onUpdateCandidate={handleUpdateCandidate}
                  timeSlots={timeSlots}
                  assignments={assignments}
                  track="design"
                />
              )}
              {activeTab === "content" && (
                <CandidateList
                  candidates={candidates.content}
                  onSelectCandidate={handleSelectCandidate}
                  selectedCandidate={selectedCandidate}
                  onChangeFormat={handleChangeInterviewFormat}
                  onRandomAssign={handleRandomAssignForCandidate}
                  onRemoveAssignment={handleRemoveAssignment}
                  onUpdateCandidate={handleUpdateCandidate}
                  timeSlots={timeSlots}
                  assignments={assignments}
                  track="content"
                />
              )}
              {activeTab === "programming" && (
                <CandidateList
                  candidates={candidates.programming}
                  onSelectCandidate={handleSelectCandidate}
                  selectedCandidate={selectedCandidate}
                  onChangeFormat={handleChangeInterviewFormat}
                  onRandomAssign={handleRandomAssignForCandidate}
                  onRemoveAssignment={handleRemoveAssignment}
                  onUpdateCandidate={handleUpdateCandidate}
                  timeSlots={timeSlots}
                  assignments={assignments}
                  track="programming"
                />
              )}
              {activeTab === "marketing" && (
                <CandidateList
                  candidates={candidates.marketing}
                  onSelectCandidate={handleSelectCandidate}
                  selectedCandidate={selectedCandidate}
                  onChangeFormat={handleChangeInterviewFormat}
                  onRandomAssign={handleRandomAssignForCandidate}
                  onRemoveAssignment={handleRemoveAssignment}
                  onUpdateCandidate={handleUpdateCandidate}
                  timeSlots={timeSlots}
                  assignments={assignments}
                  track="marketing"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
