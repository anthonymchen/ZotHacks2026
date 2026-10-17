// Everything a student has given us, saved per account so it comes back
// after logging out and in again: name, profile, classes, study styles,
// phone number and settings. Stored in this browser; the profile is also
// saved to the "users" collection in Firebase.
const PREFIX = 'zotstudy-account:'
const LEGACY_ONBOARDING_KEY = 'zotstudy-onboarding'

export function loadAccount(accountId) {
  if (!accountId) return null
  try {
    return JSON.parse(window.localStorage.getItem(PREFIX + accountId) || 'null')
  } catch {
    return null
  }
}

// Merge new details into the saved record.
export function saveAccount(accountId, patch) {
  if (!accountId) return
  const next = { ...(loadAccount(accountId) || {}), ...patch, updatedAt: new Date().toISOString() }
  try {
    window.localStorage.setItem(PREFIX + accountId, JSON.stringify(next))
  } catch {
    // Probably a very large profile photo: save everything except the photo.
    try {
      const withoutPhoto = { ...next, profile: { ...(next.profile || {}), photo: '' } }
      window.localStorage.setItem(PREFIX + accountId, JSON.stringify(withoutPhoto))
    } catch {
      // Storage blocked: nothing more we can do in this browser.
    }
  }
}

export function deleteAccount(accountId) {
  try {
    window.localStorage.removeItem(PREFIX + accountId)
  } catch {
    // Nothing to remove.
  }
}

// Data saved by onboarding before accounts were stored separately.
export function legacyOnboarding() {
  try {
    return JSON.parse(window.localStorage.getItem(LEGACY_ONBOARDING_KEY) || 'null')
  } catch {
    return null
  }
}

const YEAR_LABELS = {
  '1st year': '1st Year',
  '2nd year': '2nd Year',
  '3rd year': '3rd Year',
  '4th year': '4th Year',
  '5th+': '5th Year+',
  graduate: 'Graduate',
}

const STYLE_LABELS = {
  quiet: 'Quiet',
  collaborative: 'Collaborative',
  practice: 'Practice Problems',
  teaching: 'Collaborative',
}

// Turn onboarding answers into the profile shown on My Profile.
export function profileFromOnboarding(data = {}) {
  const firstStyle = (data.styles || []).map((style) => STYLE_LABELS[style]).find(Boolean)
  return {
    major: data.major || '',
    year: YEAR_LABELS[String(data.year || '').toLowerCase()] || data.year || '',
    email: data.email || '',
    studyStyle: firstStyle || '',
  }
}
