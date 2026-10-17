// Who is signed in, and whether they've finished onboarding.
// Set by the login page (username or Google) and by onboarding; read by
// App.jsx to decide whether someone may open the main app.
const KEY = 'zotstudy-current-user'
const ONBOARDED_KEY = 'zotstudy-onboarded'
const ONBOARDING_KEY = 'zotstudy-onboarding' // saved by Onboarding.jsx

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return value ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be blocked; the app still works for this visit.
  }
}

// A stable ID for an account: the email when we have one, otherwise the
// username typed on the login page.
function idFor(user) {
  if (!user) return ''
  if (user.id) return user.id
  if (user.email) return user.email.trim().toLowerCase()
  if (user.name) return `user:${user.name.trim().toLowerCase()}`
  return ''
}

export function setCurrentUser(user) {
  write(KEY, { ...user, id: idFor(user) })
}

export function getCurrentUser() {
  return read(KEY, null)
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
}

// Has this account finished all 3 onboarding steps?
export function isOnboarded(user) {
  const id = idFor(user)
  if (!id) return false
  if (read(ONBOARDED_KEY, []).includes(id)) return true
  // Someone who finished onboarding before this check existed.
  const saved = read(ONBOARDING_KEY, null)
  return Boolean(saved?.onboarded && user?.email && saved.email?.trim().toLowerCase() === user.email.trim().toLowerCase())
}

// Remember that these account IDs have finished onboarding.
export function markOnboarded(...users) {
  const done = new Set(read(ONBOARDED_KEY, []))
  users.forEach((user) => {
    const id = typeof user === 'string' ? user : idFor(user)
    if (id) done.add(id)
  })
  write(ONBOARDED_KEY, [...done])
}

// Forget that an account finished onboarding (used by Delete Account).
export function forgetOnboarded(...ids) {
  const remove = new Set(ids.filter(Boolean))
  write(ONBOARDED_KEY, read(ONBOARDED_KEY, []).filter((id) => !remove.has(id)))
}

// Where to go right after signing in.
export function homeFor(user) {
  return isOnboarded(user) ? '/home' : '/signup'
}
