"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Candidate, TimeSlot, TimeSlotAssignment } from "@/types/admin"
import { formatTime } from "@/lib/time-utils"
import { Search, Calendar, Monitor, MapPin, Shuffle, X, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface CandidateListProps {
  candidates: Candidate[]
  onSelectCandidate: (candidate: Candidate) => void
  selectedCandidate: Candidate | null
  onChangeFormat: (candidateId: string, format: "online" | "onsite") => void
  onRandomAssign: (candidate: Candidate) => void
  onRemoveAssignment: (candidateId: string) => void
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void
  timeSlots: TimeSlot[]
  assignments: TimeSlotAssignment[]
  track: string
}

export default function CandidateList({
  candidates,
  onSelectCandidate,
  selectedCandidate,
  onChangeFormat,
  onRandomAssign,
  onRemoveAssignment,
  onUpdateCandidate,
  timeSlots,
  assignments,
  track,
}: CandidateListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<
    "all" | "assigned" | "unassigned" | "qualified" | "not_qualified" | "not_started"
  >("all")
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null)
  const [noteText, setNoteText] = useState("")
  const debouncedNoteText = useDebounce(noteText, 300) // Debounce note text with 300ms delay

  // Effect to auto-save note when debounced value changes
  useEffect(() => {
    if (currentCandidate && noteDialogOpen) {
      // Only save if the dialog is open and we have a current candidate
      const savedStatuses = localStorage.getItem("ywc20_candidate_statuses") || "{}"
      const statuses = JSON.parse(savedStatuses)

      // Update the note in localStorage directly
      if (currentCandidate.id) {
        statuses[currentCandidate.id] = {
          ...statuses[currentCandidate.id],
          note: debouncedNoteText,
          status: currentCandidate.status || "not_started",
        }
        localStorage.setItem("ywc20_candidate_statuses", JSON.stringify(statuses))
      }
    }
  }, [debouncedNoteText, currentCandidate, noteDialogOpen])

  // Find time slot by ID
  const findTimeSlot = (slotId: string | null) => {
    if (!slotId) return null
    return timeSlots.find((slot) => slot.id === slotId)
  }

  // Filter candidates
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.id.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "assigned") return matchesSearch && candidate.timeSlot
    if (filter === "unassigned") return matchesSearch && !candidate.timeSlot
    if (filter === "qualified") return matchesSearch && candidate.status === "qualified"
    if (filter === "not_qualified") return matchesSearch && candidate.status === "not_qualified"
    if (filter === "not_started") return matchesSearch && candidate.status === "not_started"

    return matchesSearch
  })

  // Handle opening note dialog
  const handleOpenNoteDialog = (candidate: Candidate) => {
    setCurrentCandidate(candidate)
    setNoteText(candidate.note || "")
    setNoteDialogOpen(true)
  }

  // Handle saving note
  const handleSaveNote = () => {
    if (currentCandidate) {
      onUpdateCandidate(currentCandidate.id, { note: noteText })
      setNoteDialogOpen(false)
    }
  }

  // Handle changing status
  const handleChangeStatus = (candidateId: string, status: "not_started" | "qualified" | "not_qualified") => {
    onUpdateCandidate(candidateId, { status })
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "qualified":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "not_qualified":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="ค้นหาผู้สมัคร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-red-900/30 border-red-800 w-full"
          />
        </div>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-[140px] bg-red-900/30 border-red-800">
            <SelectValue placeholder="สถานะ" />
          </SelectTrigger>
          <SelectContent className="bg-black border-red-800">
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="assigned">จัดสล็อตแล้ว</SelectItem>
            <SelectItem value="unassigned">ยังไม่จัดสล็อต</SelectItem>
            <SelectItem value="qualified">ผ่านการสัมภาษณ์</SelectItem>
            <SelectItem value="not_qualified">ไม่ผ่านการสัมภาษณ์</SelectItem>
            <SelectItem value="not_started">ยังไม่ได้สัมภาษณ์</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => {
            const isSelected = selectedCandidate?.id === candidate.id
            const timeSlot = findTimeSlot(candidate.timeSlot)

            return (
              <Card
                key={candidate.id}
                className={`
                  p-3 transition-all
                  ${isSelected ? "bg-red-900/50 border-red-500" : "bg-red-900/20 border-red-800"}
                  ${candidate.timeSlot ? "border-l-green-500 border-l-4" : ""}
                `}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {candidate.firstName} {candidate.lastName}
                        {getStatusIcon(candidate.status)}
                      </div>
                      <div className="text-sm text-gray-400">{candidate.id}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={candidate.status}
                        onValueChange={(value: "not_started" | "qualified" | "not_qualified") =>
                          handleChangeStatus(candidate.id, value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs bg-red-900/30 border-red-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-red-800">
                          <SelectItem value="not_started" className="text-xs">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              ยังไม่ได้สัมภาษณ์
                            </div>
                          </SelectItem>
                          <SelectItem value="qualified" className="text-xs">
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              ผ่านการสัมภาษณ์
                            </div>
                          </SelectItem>
                          <SelectItem value="not_qualified" className="text-xs">
                            <div className="flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              ไม่ผ่านการสัมภาษณ์
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                        onClick={() => handleOpenNoteDialog(candidate)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {candidate.timeSlot ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Badge className="bg-green-900/50 w-fit">
                        <Calendar className="h-3 w-3 mr-1" />
                        {timeSlot ? `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}` : "N/A"}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Select
                          value={candidate.interviewFormat}
                          onValueChange={(value: "online" | "onsite") => onChangeFormat(candidate.id, value)}
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs bg-red-900/30 border-red-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-red-800">
                            <SelectItem value="online" className="text-xs">
                              <div className="flex items-center">
                                <Monitor className="h-3 w-3 mr-1" />
                                ออนไลน์
                              </div>
                            </SelectItem>
                            <SelectItem value="onsite" className="text-xs">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                ออนไซต์
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          onClick={() => onRemoveAssignment(candidate.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                        onClick={() => onRandomAssign(candidate)}
                      >
                        <Shuffle className="h-3 w-3 mr-1" />
                        สุ่ม
                      </Button>

                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className={
                          isSelected
                            ? "bg-red-600 hover:bg-red-700"
                            : "border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                        }
                        onClick={() => onSelectCandidate(candidate)}
                      >
                        {isSelected ? "ยกเลิก" : "จัดสล็อต"}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-400">ไม่พบผู้สมัครที่ตรงกับเงื่อนไขการค้นหา</div>
        )}
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="bg-black border-red-800 text-white max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>บันทึกข้อมูลผู้สมัคร</DialogTitle>
            <DialogDescription className="text-gray-400">
              {currentCandidate &&
                `${currentCandidate.firstName} ${currentCandidate.lastName} (${currentCandidate.id})`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="บันทึกข้อมูลเพิ่มเติมเกี่ยวกับผู้สมัคร..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[150px] bg-red-900/30 border-red-800"
            />
            <p className="text-xs text-gray-400 mt-2">บันทึกอัตโนมัติเมื่อหยุดพิมพ์</p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white w-full sm:w-auto"
              onClick={() => setNoteDialogOpen(false)}
            >
              ปิด
            </Button>
            <Button
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 w-full sm:w-auto"
              onClick={handleSaveNote}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
