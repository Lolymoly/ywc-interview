"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TimeSlot, Candidate, TimeSlotAssignment } from "@/types/admin"
import { formatTime, isSlotAvailableForTrack } from "@/lib/time-utils"
import { trackToCodePrefix } from "@/types/admin"
import { Sun, Moon } from "lucide-react"

interface TimeSlotGridProps {
  timeSlots: TimeSlot[]
  assignments: TimeSlotAssignment[]
  activeTrack: string
  onSelectTimeSlot: (slotId: string) => void
  selectedCandidate: Candidate | null
}

export default function TimeSlotGrid({
  timeSlots,
  assignments,
  activeTrack,
  onSelectTimeSlot,
  selectedCandidate,
}: TimeSlotGridProps) {
  const [timeSession, setTimeSession] = useState<"morning" | "afternoon">("morning")

  // Group time slots by hour
  const groupedSlots: Record<string, TimeSlot[]> = {}

  timeSlots.forEach((slot) => {
    const hour = slot.startTime.split(":")[0]
    if (!groupedSlots[hour]) {
      groupedSlots[hour] = []
    }
    groupedSlots[hour].push(slot)
  })

  // Filter hours based on selected session
  const morningHours = ["09", "10", "11"]
  const afternoonHours = ["13", "14", "15", "16", "17"]

  const filteredHours =
    timeSession === "morning"
      ? Object.keys(groupedSlots).filter((hour) => morningHours.includes(hour))
      : Object.keys(groupedSlots).filter((hour) => afternoonHours.includes(hour))

  // Find candidate assigned to a slot for a specific track
  const findCandidateBySlot = (slotId: string, track: string) => {
    const assignment = assignments.find((a) => a.slotId === slotId && a.track === track)
    if (!assignment) return null

    return {
      id: assignment.candidateId,
      track: assignment.track,
      interviewFormat: assignment.interviewFormat,
    }
  }

  // Check if a slot is during lunch break
  const isLunchBreak = (slot: TimeSlot) => {
    const hour = Number.parseInt(slot.startTime.split(":")[0])
    return hour === 12
  }

  // Get track color
  const getTrackColor = (track: string) => {
    switch (track) {
      case "design":
        return "bg-purple-900/50 hover:bg-purple-900/70 border-purple-700"
      case "content":
        return "bg-blue-900/50 hover:bg-blue-900/70 border-blue-700"
      case "programming":
        return "bg-green-900/50 hover:bg-green-900/70 border-green-700"
      case "marketing":
        return "bg-yellow-900/50 hover:bg-yellow-900/70 border-yellow-700"
      default:
        return "bg-gray-900/50 hover:bg-gray-900/70 border-gray-700"
    }
  }

  // Get track name
  const getTrackName = (track: string) => {
    switch (track) {
      case "design":
        return "Design"
      case "content":
        return "Content"
      case "programming":
        return "Programming"
      case "marketing":
        return "Marketing"
      default:
        return track
    }
  }

  // Get format color
  const getFormatColor = (format: string) => {
    return format === "online" ? "border-l-blue-500" : "border-l-orange-500"
  }

  return (
    <div>
      <Tabs defaultValue="morning" onValueChange={(value) => setTimeSession(value as "morning" | "afternoon")}>
        <TabsList className="grid grid-cols-2 mb-6 w-full">
          <TabsTrigger value="morning" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">รอบเช้า</span> <span className="sm:hidden">เช้า</span> (9:00 - 12:00)
          </TabsTrigger>
          <TabsTrigger value="afternoon" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">รอบบ่าย</span> <span className="sm:hidden">บ่าย</span> (13:00 - 18:00)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="morning" className="mt-0">
          <div className="grid grid-cols-1 gap-4">
            {filteredHours.sort().map((hour) => (
              <div key={hour} className="mb-2">
                <h3 className="text-lg font-semibold mb-2">{hour}:00</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {groupedSlots[hour].map((slot) => {
                    const isLunch = isLunchBreak(slot)
                    const isAvailable = isSlotAvailableForTrack(slot.id, assignments, activeTrack)

                    // Get candidates for all tracks for this slot
                    const designCandidate = findCandidateBySlot(slot.id, "design")
                    const contentCandidate = findCandidateBySlot(slot.id, "content")
                    const programmingCandidate = findCandidateBySlot(slot.id, "programming")
                    const marketingCandidate = findCandidateBySlot(slot.id, "marketing")

                    // Get active track candidate
                    const activeTrackCandidate = findCandidateBySlot(slot.id, activeTrack)

                    return (
                      <TooltipProvider key={slot.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card
                              className={`
                                p-2 text-center cursor-pointer transition-all
                                ${
                                  isLunch
                                    ? "bg-gray-800 border-gray-700 opacity-50"
                                    : isAvailable
                                      ? selectedCandidate
                                        ? "bg-green-900/20 border-green-700 hover:bg-green-900/40"
                                        : "bg-red-900/20 border-red-800"
                                      : "bg-red-900/50 border-red-700"
                                }
                                ${activeTrackCandidate ? getFormatColor(activeTrackCandidate.interviewFormat) + " border-l-4" : ""}
                              `}
                              onClick={() => {
                                if (!isLunch && selectedCandidate && isAvailable) {
                                  onSelectTimeSlot(slot.id)
                                }
                              }}
                            >
                              <div className="text-sm font-medium">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </div>

                              {isLunch ? (
                                <div className="mt-1">
                                  <Badge variant="outline" className="bg-gray-800/50 border-gray-700">
                                    พักเที่ยง
                                  </Badge>
                                </div>
                              ) : (
                                <div className="mt-1 flex flex-col gap-1">
                                  {/* Show full interview codes for each track that has an assignment */}
                                  {designCandidate && (
                                    <Badge className={getTrackColor("design") + " text-white"}>
                                      {trackToCodePrefix.design +
                                        designCandidate.id.substring(designCandidate.id.length - 2)}
                                    </Badge>
                                  )}
                                  {contentCandidate && (
                                    <Badge className={getTrackColor("content") + " text-white"}>
                                      {trackToCodePrefix.content +
                                        contentCandidate.id.substring(contentCandidate.id.length - 2)}
                                    </Badge>
                                  )}
                                  {programmingCandidate && (
                                    <Badge className={getTrackColor("programming") + " text-white"}>
                                      {trackToCodePrefix.programming +
                                        programmingCandidate.id.substring(programmingCandidate.id.length - 2)}
                                    </Badge>
                                  )}
                                  {marketingCandidate && (
                                    <Badge className={getTrackColor("marketing") + " text-white"}>
                                      {trackToCodePrefix.marketing +
                                        marketingCandidate.id.substring(marketingCandidate.id.length - 2)}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            {isLunch ? (
                              <p>พักเที่ยง</p>
                            ) : (
                              <div className="space-y-1">
                                <p className="font-semibold">
                                  สล็อตเวลา: {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </p>

                                {/* Show details for each track */}
                                {designCandidate && (
                                  <p className="text-xs text-purple-300">
                                    Design: {designCandidate.id} (
                                    {designCandidate.interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"})
                                  </p>
                                )}
                                {contentCandidate && (
                                  <p className="text-xs text-blue-300">
                                    Content: {contentCandidate.id} (
                                    {contentCandidate.interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"})
                                  </p>
                                )}
                                {programmingCandidate && (
                                  <p className="text-xs text-green-300">
                                    Programming: {programmingCandidate.id} (
                                    {programmingCandidate.interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"})
                                  </p>
                                )}
                                {marketingCandidate && (
                                  <p className="text-xs text-yellow-300">
                                    Marketing: {marketingCandidate.id} (
                                    {marketingCandidate.interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"})
                                  </p>
                                )}

                                {/* Show message for active track */}
                                {!activeTrackCandidate && selectedCandidate && isAvailable && (
                                  <p className="text-xs text-green-300">
                                    คลิกเพื่อจัดสล็อตให้ {selectedCandidate.firstName} {selectedCandidate.lastName}
                                  </p>
                                )}

                                {!designCandidate &&
                                  !contentCandidate &&
                                  !programmingCandidate &&
                                  !marketingCandidate &&
                                  !selectedCandidate && <p className="text-xs">สล็อตว่างทุกสาขา</p>}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="afternoon" className="mt-0">
          <div className="grid grid-cols-1 gap-4">
            {filteredHours.sort().map((hour) => (
              <div key={hour} className="mb-2">
                <h3 className="text-lg font-semibold mb-2">{hour}:00</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {groupedSlots[hour].map((slot) => {
                    const isLunch = isLunchBreak(slot)
                    const isAvailable = isSlotAvailableForTrack(slot.id, assignments, activeTrack)

                    // Get candidates for all tracks for this slot
                    const designCandidate = findCandidateBySlot(slot.id, "design")
                    const contentCandidate = findCandidateBySlot(slot.id, "content")
                    const programmingCandidate = findCandidateBySlot(slot.id, "programming")
                    const marketingCandidate = findCandidateBySlot(slot.id, "marketing")

                    // Get active track candidate
                    const activeTrackCandidate = findCandidateBySlot(slot.id, activeTrack)

                    return (
                      <TooltipProvider key={slot.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card
                              className={`
                                p-2 text-center cursor-pointer transition-all
                                ${
                                  isLunch
                                    ? "bg-gray-800 border-gray-700 opacity-50"
                                    : isAvailable
                                      ? selectedCandidate
                                        ? "bg-green-900/20 border-green-700 hover:bg-green-900/40"
                                        : "bg-red-900/20 border-red-800"
                                      : "bg-red-900/50 border-red-700"
                                }
                                ${activeTrackCandidate ? getFormatColor(activeTrackCandidate.interviewFormat) + " border-l-4" : ""}
                              `}
                              onClick={() => {
                                if (!isLunch && selectedCandidate && isAvailable) {
                                  onSelectTimeSlot(slot.id)
                                }
                              }}
                            >
                              <div className="text-sm font-medium">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </div>

                              {isLunch ? (
                                <div className="mt-1">
                                  <Badge variant="outline" className="bg-gray-800/50 border-gray-700">
                                    พักเที่ยง
                                  </Badge>
                                </div>
                              ) : (
                                <div className="mt-1 flex flex-col gap-1">
                                  {/* Show full interview codes for each track that has an assignment */}
                                  {designCandidate && (
                                    <Badge className={getTrackColor("design") + " text-white"}>
                                      {trackToCodePrefix.design +
                                        designCandidate.id.substring(designCandidate.id.length - 2)}
                                    </Badge>
                                  )}
                                  {contentCandidate && (
                                    <Badge className={getTrackColor("content") + " text-white"}>
                                      {trackToCodePrefix.content +
                                        contentCandidate.id.substring(contentCandidate.id.length - 2)}
                                    </Badge>
                                  )}
                                  {programmingCandidate && (
                                    <Badge className={getTrackColor("programming") + " text-white"}>
                                      {trackToCodePrefix.programming +
                                        programmingCandidate.id.substring(programmingCandidate.id.length - 2)}
                                    </Badge>
                                  )}
                                  {marketingCandidate && (
                                    <Badge className={getTrackColor("marketing") + " text-white"}>
                                      {trackToCodePrefix.marketing +
                                        marketingCandidate.id.substring(marketingCandidate.id.length - 2)}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            {isLunch ? (
                              <p>พักเที่ยง</p>
                            ) : (
                              <div className="space-y-1">
                                <p className="font-semibold">
                                  สล็อตเวลา: {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </p>

                                {/* Show details for each track */}
                                {designCandidate && (
                                  <p className="text-xs text-purple-300">
                                    Design: {designCandidate.id} (
                                    {designCandidate.interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"})
                                  </p>
                                )}
                                {contentCandidate && (
                                  <p className="text-xs text-blue-300">
                                    Content: {contentCandidate.id} (
                                    {contentCandidate.interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"})
                                  </p>
                                )}
                                {programmingCandidate && (
                                  <p className="text-xs text-green-300">
                                    Programming: {programmingCandidate.id} (
                                    {programmingCandidate.interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"})
                                  </p>
                                )}
                                {marketingCandidate && (
                                  <p className="text-xs text-yellow-300">
                                    Marketing: {marketingCandidate.id} (
                                    {marketingCandidate.interviewFormat === "online" ? "ออนไลน์" : "ออนไซต์"})
                                  </p>
                                )}

                                {/* Show message for active track */}
                                {!activeTrackCandidate && selectedCandidate && isAvailable && (
                                  <p className="text-xs text-green-300">
                                    คลิกเพื่อจัดสล็อตให้ {selectedCandidate.firstName} {selectedCandidate.lastName}
                                  </p>
                                )}

                                {!designCandidate &&
                                  !contentCandidate &&
                                  !programmingCandidate &&
                                  !marketingCandidate &&
                                  !selectedCandidate && <p className="text-xs">สล็อตว่างทุกสาขา</p>}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
