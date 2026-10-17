import { canonicalCourse } from './lib/uciCourses'

// Shared helpers for filtering and validating study sessions.

export function filterSessions(sessions, selectedStyles, professorQuery, courseFilter = '') {
  const query = professorQuery.trim().toLowerCase()
  return sessions
    .filter((session) => {
      const styleOk =
        selectedStyles.length === 0 || selectedStyles.includes(session.style)
      const professorOk = (session.professor || '').toLowerCase().includes(query)
      const courseOk = !courseFilter || session.course === courseFilter
      return styleOk && professorOk && courseOk
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start))
}

// Every course that has a session, plus the user's own courses, sorted A-Z.
export function courseOptions(sessions, courses = []) {
  return [...new Set([...courses, ...sessions.map((session) => session.course)])].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )
}

// True when two sessions share any stretch of time (back-to-back is fine).
export function overlaps(a, b) {
  const aStart = new Date(a.start).getTime()
  const aEnd = new Date(a.end).getTime()
  const bStart = new Date(b.start).getTime()
  const bEnd = new Date(b.end).getTime()
  if ([aStart, aEnd, bStart, bEnd].some(Number.isNaN)) return false
  return aStart < bEnd && bStart < aEnd
}

// The host is stored separately from attendees but still counts toward the
// group size (see headcount).
export function isHost(session, user) {
  return session.hostName === user || session.ownerName === user || Boolean(session.mine)
}

// People in the session, host included: the host takes one of the spots.
export function headcount(session) {
  return session.attendees.filter((name) => name !== session.hostName).length + 1
}

// Hosting or joined.
export function isMember(session, user) {
  return isHost(session, user) || session.attendees.includes(user)
}

// "math 2b", "MATH 2B" and "Math  2B" are the same course, and everyday
// names match UCI's official ones ("ICS 31" = "I&C SCI 31").
export function normalizeCourse(course) {
  return canonicalCourse(course)
}

export function hasEnded(session, now = Date.now()) {
  const end = new Date(session.end).getTime()
  return !Number.isNaN(end) && end <= now
}

// Sessions the user is already in (joined or hosting) that clash with this one.
export function findConflicts(session, sessions, user) {
  if (isMember(session, user)) return []
  return sessions.filter(
    (other) => other.id !== session.id && isMember(other, user) && overlaps(session, other),
  )
}

// Short sentence describing the clash, e.g. "Overlaps with your ICS 31 session (Today, 3:00 PM – 5:00 PM)".
export function describeConflicts(conflicts, formatWhen) {
  if (conflicts.length === 0) return ''
  if (conflicts.length === 1) {
    const [other] = conflicts
    return `Overlaps with your ${other.course} session (${formatWhen(other.start, other.end)})`
  }
  return `Overlaps with ${conflicts.length} of your sessions: ${conflicts.map((other) => other.course).join(', ')}`
}

// 1-based place in line, or 0 when not waiting.
export function waitlistPosition(session, user) {
  return (session.waitlist || []).indexOf(user) + 1
}

// Other sessions for the same course that still have room.
export function openAlternatives(session, sessions, user) {
  return sessions
    .filter(
      (other) =>
        other.id !== session.id &&
        other.course === session.course &&
        !isMember(other, user) &&
        !isFull(other),
    )
    .sort((a, b) => new Date(a.start) - new Date(b.start))
}

export function isFull(session) {
  return Boolean(session.capacity) && headcount(session) >= session.capacity
}

// Phone numbers: 10 digits (US) or 11-15 digits with a country code.
export function phoneProblem(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return 'Add a phone number so your group can reach you.'
  if (digits.length < 10 || digits.length > 15) return 'Enter a valid phone number, like (949) 555-0123.'
  return ''
}

// (949) 555-0123 for US numbers, +44 7911 123456 style otherwise.
export function formatPhone(value) {
  const raw = String(value || '').trim()
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  if (digits.length === 11 && digits.startsWith('1')) return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  return raw.startsWith('+') ? raw : `+${digits}`
}

// Phone number someone shared when they joined or created the session.
export function contactFor(session, name) {
  const entry = (session.contacts || []).find((contact) => contact.name === name)
  if (entry) return entry.phone
  return name === session.hostName ? session.hostPhone || '' : ''
}

export function validateSession({ course, start, end, hostName, hostPhone }) {
  const errors = {}
  if (!course.trim()) {
    errors.course = 'Course cannot be empty.'
  }
  if (!start) {
    errors.start = 'Pick a start time.'
  }
  if (!end) {
    errors.end = 'Pick an end time.'
  } else if (start && new Date(end) <= new Date(start)) {
    errors.end = 'End time must be after start time.'
  }
  if (!hostName.trim()) {
    errors.hostName = 'Host name cannot be empty.'
  }
  const phoneIssue = phoneProblem(hostPhone)
  if (phoneIssue) {
    errors.hostPhone = phoneIssue
  }
  return errors
}
