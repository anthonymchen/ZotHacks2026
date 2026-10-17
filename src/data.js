// Every study session holds at most this many people (host included).
export const MAX_GROUP_SIZE = 8

export const LOCATIONS = [
  'Langson Library',
  'Science Library',
  'Gateway Study Center',
  'Student Center',
  'Anteater Learning Pavilion',
  'Engineering Hall',
  'Humanities Hall',
]

export const STYLES = [
  'Silent',
  'Quiet',
  'Collaborative',
  'Practice Problems',
  'Exam Review',
]

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+', 'Graduate']

export const EMPTY_PROFILE = {
  photo: '',
  pronouns: '',
  major: '',
  year: '',
  bio: '',
  studyStyle: '',
  email: '',
  discord: '',
}

export const SESSION_LENGTHS = [
  { value: 30, label: '30 Minutes' },
  { value: 60, label: '1 Hour' },
  { value: 90, label: '1.5 Hours' },
  { value: 120, label: '2 Hours' },
  { value: 180, label: '3 Hours' },
]

export const REMINDER_TIMES = [
  { value: 15, label: '15 Minutes Before' },
  { value: 30, label: '30 Minutes Before' },
  { value: 60, label: '1 Hour Before' },
  { value: 1440, label: '1 Day Before' },
]

export const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'classmates', label: 'Classmates in My Courses' },
  { value: 'private', label: 'Only Me' },
]

export const DEFAULT_SETTINGS = {
  theme: 'light',
  reduceMotion: false,
  sessionReminders: true,
  reminderLead: 30,
  waitlistAlerts: true,
  buddyRequests: true,
  emailSummaries: false,
  defaultLength: 60,
  defaultLocation: 'Langson Library',
  defaultStyle: 'Silent',
  hideConflicts: false,
  profileVisibility: 'classmates',
  showInBuddies: true,
  showNameInLists: true,
}

export const SUGGESTED_COURSES = [
  'ICS 31',
  'Math 2B',
  'Writing 39C',
  'ICS 46',
  'PHYSICS 7C',
]

function atToday(hours, minutes) {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

function atTomorrow(hours, minutes) {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const INITIAL_SESSIONS = [
  {
    id: 's1',
    course: 'ICS 31',
    location: 'Science Library',
    start: atToday(15, 0),
    end: atToday(17, 0),
    style: 'Collaborative',
    tags: ['Collaborative', 'Practice Problems'],
    professor: 'Pattis',
    hostName: 'Maya',
    attendees: ['Maya', 'Chris', 'Sam', 'Priya', 'Jordan'],
    capacity: MAX_GROUP_SIZE,
    waitlist: [],
  },
  {
    id: 's2',
    course: 'Math 2B',
    location: 'Langson Library',
    start: atToday(11, 30),
    end: atToday(13, 0),
    style: 'Quiet',
    tags: ['Quiet'],
    professor: 'Le',
    hostName: 'Sam',
    attendees: ['Sam'],
    capacity: MAX_GROUP_SIZE,
    waitlist: [],
  },
  {
    id: 's3',
    course: 'Writing 39C',
    location: 'Student Center',
    start: atToday(17, 0),
    end: atToday(18, 30),
    style: 'Silent',
    tags: ['Silent'],
    professor: '',
    hostName: 'Priya',
    attendees: ['Priya', 'Jordan'],
    capacity: MAX_GROUP_SIZE,
    waitlist: [],
  },
  {
    id: 's4',
    course: 'ICS 46',
    location: 'Anteater Learning Pavilion',
    start: atToday(14, 0),
    end: atToday(16, 0),
    style: 'Exam Review',
    tags: ['Exam Review'],
    professor: 'Pattis',
    hostName: 'Riley',
    attendees: ['Riley'],
    capacity: MAX_GROUP_SIZE,
    waitlist: [],
  },
  {
    // Full, and you're already in it (two people waiting behind you).
    id: 's5',
    course: 'ICS 33',
    location: 'Gateway Study Center',
    start: atTomorrow(18, 0),
    end: atTomorrow(20, 0),
    style: 'Practice Problems',
    tags: ['Practice Problems'],
    professor: 'Thornton',
    hostName: 'Taylor',
    attendees: ['Taylor', 'Alex', 'Chris', 'Sam', 'Priya', 'Jordan', 'Riley', 'Maya'],
    capacity: MAX_GROUP_SIZE,
    waitlist: ['Kai', 'Morgan'],
  },
  {
    // Full, and you're not in it (there's an open Math 2B session today).
    id: 's6',
    course: 'Math 2B',
    location: 'Science Library',
    start: atTomorrow(13, 0),
    end: atTomorrow(15, 0),
    style: 'Exam Review',
    tags: ['Exam Review'],
    professor: 'Le',
    hostName: 'Devon',
    attendees: ['Devon', 'Chris', 'Sam', 'Priya', 'Jordan', 'Riley', 'Maya', 'Taylor'],
    capacity: MAX_GROUP_SIZE,
    waitlist: ['Jamie'],
  },
]

export const STUDY_BUDDIES = [
  { id: 'b1', name: 'Maya Chen', courses: ['ICS 31', 'ICS 46'], style: 'Collaborative' },
  { id: 'b2', name: 'Sam Ortiz', courses: ['Math 2B', 'ICS 31'], style: 'Quiet' },
  { id: 'b3', name: 'Priya Shah', courses: ['Writing 39C'], style: 'Silent' },
  { id: 'b4', name: 'Jordan Lee', courses: ['ICS 31', 'Writing 39C'], style: 'Practice Problems' },
]
