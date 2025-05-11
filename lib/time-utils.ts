import type { TimeSlot, TimeSlotAssignment } from "@/types/admin"

// Generate time slots from 9:00 to 18:00 with 15-minute intervals
export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  const startHour = 9
  const endHour = 18

  for (let hour = startHour; hour < endHour; hour++) {
    // Skip lunch break (12:00 - 13:00)
    if (hour === 12) continue

    for (let minute = 0; minute < 60; minute += 15) {
      const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

      // Calculate end time
      let endHour = hour
      let endMinute = minute + 15

      if (endMinute >= 60) {
        endHour += 1
        endMinute -= 60
      }

      // Skip if end time is after 18:00
      if (endHour > endHour) continue

      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`

      slots.push({
        id: `slot-${startTime.replace(":", "")}`,
        startTime,
        endTime,
      })
    }
  }

  return slots
}

// Format time (e.g., "09:00" to "9:00")
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  return `${Number.parseInt(hours)}:${minutes}`
}

// Get a random available time slot for a specific track
export function getRandomAvailableSlot(
  timeSlots: TimeSlot[],
  assignments: TimeSlotAssignment[],
  track: string,
): TimeSlot | null {
  const availableSlots = timeSlots.filter((slot) => {
    // Skip lunch break slots
    const hour = Number.parseInt(slot.startTime.split(":")[0])
    if (hour === 12) return false

    // Check if slot is already assigned for this track
    return !assignments.some((a) => a.slotId === slot.id && a.track === track)
  })

  if (availableSlots.length === 0) return null

  const randomIndex = Math.floor(Math.random() * availableSlots.length)
  return availableSlots[randomIndex]
}

// Check if a slot is available for a specific track
export function isSlotAvailableForTrack(slotId: string, assignments: TimeSlotAssignment[], track: string): boolean {
  return !assignments.some((a) => a.slotId === slotId && a.track === track)
}

// Get assignment for a specific candidate
export function getCandidateAssignment(
  candidateId: string,
  assignments: TimeSlotAssignment[],
): TimeSlotAssignment | undefined {
  return assignments.find((a) => a.candidateId === candidateId)
}
