// Who is signed in: set by the login page (username or Google) and by
// onboarding, read by the main app to greet the student by name.
const KEY = 'zotstudy-current-user'

export function setCurrentUser(user) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user))
  } catch {
    // Storage can be blocked; the app falls back to a placeholder name.
  }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
}
