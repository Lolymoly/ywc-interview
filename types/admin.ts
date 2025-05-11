export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  major: string
  timeSlot: string | null
  interviewFormat: "online" | "onsite"
  note?: string
  status: "not_started" | "qualified" | "not_qualified"
}

// Add track information to time slot assignments
export interface TimeSlotAssignment {
  slotId: string
  candidateId: string
  track: string
  interviewFormat: "online" | "onsite"
}

// Map track to interview code prefix
export const trackToCodePrefix: Record<string, string> = {
  design: "DS",
  content: "CT",
  programming: "PG",
  marketing: "MK",
}

// Map status to display text
export const statusToDisplay: Record<string, string> = {
  not_started: "ยังไม่ได้สัมภาษณ์",
  qualified: "ผ่านการสัมภาษณ์",
  not_qualified: "ไม่ผ่านการสัมภาษณ์",
}
