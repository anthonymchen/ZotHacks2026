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

// Sessions the user is already in (joined or hosting) that clash with this one.
export function findConflicts(session, sessions, user) {
  if (session.attendees.includes(user)) return []
  return sessions.filter(
    (other) => other.id !== session.id && other.attendees.includes(user) && overlaps(session, other),
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
        !other.attendees.includes(user) &&
        !isFull(other),
    )
    .sort((a, b) => new Date(a.start) - new Date(b.start))
}

export function isFull(session) {
  return Boolean(session.capacity) && session.attendees.length >= session.capacity
}

export function validateSession({ course, start, end, hostName }) {
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
  return errors
}
