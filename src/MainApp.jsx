import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { INITIAL_SESSIONS, EMPTY_PROFILE, DEFAULT_SETTINGS } from './data'
import AppShell from './components/AppShell'
import ConfirmDialog from './components/ConfirmDialog'
import SessionDrawer from './components/SessionDrawer'
import Toast from './components/Toast'
import PhoneDialog from './components/PhoneDialog'
import { WaveScene, SleepScene, ThinkScene } from './components/Scenes'
import {
  findConflicts,
  describeConflicts,
  isMember,
  isHost,
  isFull,
  normalizeCourse,
  hasEnded,
} from './sessions.js'
import { formatSessionWhen } from './time'
import {
  createSession as saveSessionToFirebase,
  subscribeSessions,
  joinSession as joinSessionInFirebase,
  leaveSession as leaveSessionInFirebase,
  endSession as endSessionInFirebase,
  renameInSession as renameInFirebaseSession,
} from './lib/sessions'
import { saveProfile as saveUserToFirebase } from './lib/users'
import { saveAccount, deleteAccount } from './accountData'
import { forgetOnboarded } from './currentUser'
import Home from './pages/Home'
import StudyBuddies from './pages/StudyBuddies'
import StudySessions from './pages/StudySessions'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import CreateSession from './pages/CreateSession'
import './App.css'

// The main ZotStudy app (home, sessions, buddies, profile, settings).
// The login and onboarding pages live in Login.jsx and onboarding/, and
// App.jsx routes between them. This page is shown at /home. Until login is
// connected it uses a placeholder student. To pass the real student in, render:
//   <MainApp user={name} courses={selectedCourses} onLogout={goToLogin} />
const DEMO_USER = 'Alex'
const DEMO_COURSES = ['ICS 31', 'Math 2B', 'Writing 39C']
const SETTINGS_KEY = 'zotstudy-settings'
const ONBOARDING_KEY = 'zotstudy-onboarding'
const PHONE_KEY = 'zotstudy-phone'

function loadPhone() {
  try {
    return window.localStorage.getItem(PHONE_KEY) || ''
  } catch {
    return ''
  }
}

// Keep the student's classes after a reload: update the profile saved in
// this browser and the "users" record in Firebase (stored as a list, so
// they show up as courses 0, 1, 2… in the console).
function persistCourses(courses, accountId, previousList = []) {
  const previous = new Map(
    previousList.map((course) => (typeof course === 'string' ? [course, { code: course }] : [course.code, course])),
  )
  const list = courses.map((code) => ({ professor: '', ...(previous.get(code) || {}), code }))
  saveAccount(accountId, { courses: list })
  try {
    // Older code reads this single record too.
    const saved = JSON.parse(window.localStorage.getItem(ONBOARDING_KEY) || 'null')
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...(saved || {}), courses: list }))
  } catch {
    // Storage blocked: Firebase still gets the update below.
  }
  saveUserToFirebase({ courses: list }).catch((error) => console.error('Could not save courses to Firebase', error))
  return list
}

// Settings are remembered in this browser. Storage can be unavailable
// (private windows, blocked site data), so every access is guarded.
function loadSettings() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || 'null')
    return saved && typeof saved === 'object' ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function storeSettings(settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Nothing to do: settings still work for this visit.
  }
}

export default function MainApp({
  user = DEMO_USER,
  courses: initialCourses = DEMO_COURSES,
  accountId = '',
  account = null,
  onLogout,
}) {
  const [page, setPage] = useState('home')
  const [currentUser, setCurrentUser] = useState(user)
  // Profile, settings and phone come back from this account's saved record.
  const [profile, setProfile] = useState(() => ({ ...EMPTY_PROFILE, ...(account?.profile || {}) }))
  const courseRecords = useRef(account?.courses || [])
  const [courses, setCourses] = useState(initialCourses)
  // Sessions come live from Firebase. Until it answers the list is empty;
  // if it can't be reached we fall back to the sample sessions.
  const [sessions, setSessions] = useState([])
  const [live, setLive] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState([])
  const [professorQuery, setProfessorQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [leavingId, setLeavingId] = useState(null)
  const leaving = sessions.find((session) => session.id === leavingId)
  const [endingId, setEndingId] = useState(null)
  const ending = sessions.find((session) => session.id === endingId)
  const endingOthers = ending ? ending.attendees.filter((name) => name !== currentUser && name !== ending.hostName).length : 0
  const [sessionsTab, setSessionsTab] = useState('all')
  const [openId, setOpenId] = useState(null)
  const [conflictId, setConflictId] = useState(null)
  // Joining asks for a phone number first.
  const [joiningId, setJoiningId] = useState(null)
  const joining = sessions.find((session) => session.id === joiningId)
  const [savedPhone, setSavedPhone] = useState(() => (account ? account.phone || '' : loadPhone()))
  const [toast, setToast] = useState(null)
  // Each account has its own settings; only pre-account browsers use the shared copy.
  const [settings, setSettings] = useState(() =>
    account ? { ...DEFAULT_SETTINGS, ...(account.settings || {}) } : loadSettings(),
  )
  const [settingsDialog, setSettingsDialog] = useState(null) // 'reset' | 'delete'

  // Dark mode and reduced motion only apply inside the main app, so the
  // login and onboarding pages keep their own look.
  useLayoutEffect(
    () => () => {
      delete document.documentElement.dataset.theme
      delete document.documentElement.dataset.motion
    },
    [],
  )

  // Layout effect: apply the theme before the first paint (no flash).
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.dataset.motion = settings.reduceMotion ? 'reduce' : 'full'
    storeSettings(settings)
  }, [settings])

  function changeSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function notify(message) {
    setToast({ id: Date.now(), message })
  }

  function downloadData() {
    const data = {
      exportedAt: new Date().toISOString(),
      name: currentUser,
      profile: { ...profile, photo: profile.photo ? '(photo not included)' : '' },
      courses,
      hosting: sessions.filter((session) => session.hostName === currentUser),
      joined: sessions.filter(
        (session) => session.attendees.includes(currentUser) && session.hostName !== currentUser,
      ),
      settings,
    }
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'zotstudy-data.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      notify('Your data was downloaded as zotstudy-data.json.')
    } catch {
      notify("Your data couldn't be downloaded. Please try again.")
    }
  }
  const clearToast = useCallback(() => setToast(null), [])
  // Re-check every minute so sessions disappear once their end time passes.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  // What the student sees: sessions that haven't ended, for classes they
  // take. Full sessions are hidden unless you're in them, and come back
  // as soon as someone leaves.
  const myCourseKeys = courses.map(normalizeCourse)
  const visibleSessions = sessions.filter((session) => {
    if (hasEnded(session, now)) return false
    if (isMember(session, currentUser)) return true
    return myCourseKeys.includes(normalizeCourse(session.course)) && !isFull(session)
  })

  // Listen to Firebase. When someone joins a session you host, tell you.
  const nameRef = useRef(currentUser)
  nameRef.current = currentUser
  const alertsRef = useRef(settings.waitlistAlerts)
  alertsRef.current = settings.waitlistAlerts
  const seenRef = useRef(null)
  useEffect(() => {
    const stop = subscribeSessions(
      (list) => {
        const before = seenRef.current
        const me = nameRef.current
        if (before && alertsRef.current) {
          list.forEach((session) => {
            const previous = before.get(session.id)
            if (!previous || !isHost(session, me)) return
            session.attendees
              .filter((name) => !previous.includes(name) && name !== me && name !== session.hostName)
              .forEach((name) => notify(`${name} joined your ${session.course} study session.`))
          })
        }
        seenRef.current = new Map(list.map((session) => [session.id, [...session.attendees]]))
        setSessions(list)
        setLive(true)
      },
      (error) => {
        console.error('Could not load sessions from Firebase', error)
        setLive(false)
        setSessions((prev) => (prev.length ? prev : INITIAL_SESSIONS))
      },
      accountId,
    )
    return stop
  }, [accountId])

  // Save the class list whenever it changes (not on first load).
  const coursesLoaded = useRef(false)
  useEffect(() => {
    if (!coursesLoaded.current) {
      coursesLoaded.current = true
      return
    }
    courseRecords.current = persistCourses(courses, accountId, courseRecords.current)
  }, [courses, accountId])

  // Keep this account's record up to date so it all comes back after logging in again.
  const deletedRef = useRef(false)
  useEffect(() => {
    if (deletedRef.current) return
    saveAccount(accountId, { name: currentUser, profile, settings, phone: savedPhone })
  }, [accountId, currentUser, profile, settings, savedPhone])

  const conflictsFor = (session) => findConflicts(session, visibleSessions, currentUser)
  const pendingJoin = sessions.find((session) => session.id === conflictId)
  const pendingConflicts = pendingJoin ? conflictsFor(pendingJoin) : []
  const openSession = sessions.find((session) => session.id === openId)

  // Logging out keeps everything saved for next time.
  function logout() {
    setSettingsDialog(null)
    setSessionsTab('all')
    setOpenId(null)
    setConflictId(null)
    setToast(null)
    clearFilters()
    if (onLogout) {
      onLogout()
      return
    }
    // No login page connected yet: start fresh on the home page.
    setPage('home')
  }

  function toggleStyle(style) {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((item) => item !== style) : [...prev, style],
    )
  }

  function clearFilters() {
    setSelectedStyles([])
    setProfessorQuery('')
    setCourseFilter('')
  }

  function addCourse(course) {
    const code = normalizeCourse(course)
    if (!code) return
    setCourses((prev) => (prev.some((item) => normalizeCourse(item) === code) ? prev : [...prev, code]))
  }

  function removeCourse(course) {
    setCourses((prev) => prev.filter((item) => item !== course))
  }

  function saveProfile({ name, ...details }) {
    const oldName = currentUser
    if (name !== oldName) {
      // Keep the user's joined and hosted sessions linked to the new name,
      // in Firebase too so other people see it and it survives a reload.
      const rename = (person) => (person === oldName ? name : person)
      if (live) {
        sessions
          .filter((session) => session.firebaseId && isMember(session, oldName))
          .forEach((session) => {
            renameInFirebaseSession(session.firebaseId, {
              oldName,
              newName: name,
              attendees: session.attendees,
              hosting: isHost(session, oldName),
            }).catch((error) => console.error('Could not rename in session', error))
          })
      }
      setSessions((prev) =>
        prev.map((session) => ({
          ...session,
          hostName: rename(session.hostName),
          ownerName: session.ownerName ? rename(session.ownerName) : session.ownerName,
          attendees: session.attendees.map(rename),
        })),
      )
      setCurrentUser(name)
    }
    setProfile(details)
    const { photo, ...shareable } = details
    saveUserToFirebase({ name, ...shareable, hasPhoto: Boolean(photo) }).catch((error) =>
      console.error('Could not save profile to Firebase', error),
    )
  }

  // Remember the last phone number used, here and on the user's record.
  function rememberPhone(phone) {
    setSavedPhone(phone)
    try {
      window.localStorage.setItem(PHONE_KEY, phone)
    } catch {
      // Storage blocked: still saved to Firebase below.
    }
    saveUserToFirebase({ phone }).catch((error) => console.error('Could not save phone to Firebase', error))
  }

  function leaveSession(sessionId) {
    const target = sessions.find((session) => session.id === sessionId)
    if (!target) return
    const myContacts = (target.contacts || []).filter((contact) => contact.name === currentUser)
    if (live && target.firebaseId) {
      leaveSessionInFirebase(target.firebaseId, { name: currentUser, id: accountId, contacts: myContacts }).catch((error) => {
        console.error('Could not leave session in Firebase', error)
        notify("Couldn't leave the session. Check your connection and try again.")
      })
      return
    }
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              attendees: session.attendees.filter((name) => name !== currentUser),
              contacts: (session.contacts || []).filter((contact) => contact.name !== currentUser),
            }
          : session,
      ),
    )
  }

  const closeDrawer = useCallback(() => setOpenId(null), [])
  const closeJoin = useCallback(() => setJoiningId(null), [])

  function endSession(sessionId) {
    const target = sessions.find((session) => session.id === sessionId)
    if (live && target?.firebaseId) {
      endSessionInFirebase(target.firebaseId)
        .then(() => notify(`Your ${target.course} session was ended.`))
        .catch((error) => {
          console.error('Could not end session in Firebase', error)
          notify("Couldn't end the session. Check your connection and try again.")
        })
      return
    }
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
  }

  // Joining a session that clashes with one you're in asks first.
  function requestJoin(sessionId) {
    const target = sessions.find((session) => session.id === sessionId)
    if (target && conflictsFor(target).length > 0) {
      setConflictId(sessionId)
      return
    }
    setJoiningId(sessionId)
  }

  // Joining is instant: you're added to the attendees in Firebase and the
  // host gets a notification.
  function joinSession(sessionId, phone) {
    const target = sessions.find((session) => session.id === sessionId)
    if (!target) return
    if (isMember(target, currentUser)) {
      notify(`You're already in this ${target.course} session.`)
      return
    }
    if (isFull(target)) {
      notify('Sorry, that session just filled up.')
      return
    }
    if (live && target.firebaseId) {
      joinSessionInFirebase(target.firebaseId, { name: currentUser, id: accountId, phone })
        .then(() => notify(`You joined the ${target.course} study session.`))
        .catch((error) => {
          console.error('Could not join session in Firebase', error)
          notify("Couldn't join the session. Check your connection and try again.")
        })
      return
    }
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              attendees: [...session.attendees, currentUser],
              contacts: [...(session.contacts || []), { name: currentUser, phone }],
            }
          : session,
      ),
    )
  }

  // Going to Study Sessions always opens on the All Sessions tab.
  function navigate(next) {
    if (next === 'sessions') setSessionsTab('all')
    setPage(next)
  }

  function handleCreated(session) {
    if (session.hostPhone) rememberPhone(session.hostPhone)
    // Save to the "sessions" collection in Firebase. While connected, the
    // live listener adds it to the list; otherwise it's kept on this device.
    saveSessionToFirebase({ ...session, hostAccount: accountId })
      .then(() => notify(`Your ${session.course} session was saved.`))
      .catch((error) => {
        console.error('Could not save session to Firebase', error)
        notify("Couldn't save your session to the server. It's only on this device for now.")
        if (live) setSessions((prev) => [session, ...prev])
      })
    if (!live) setSessions((prev) => [session, ...prev])
    setSessionsTab('mine')
    setPage('sessions')
  }

  let content = null
  if (page === 'buddies') {
    content = <StudyBuddies courses={courses} hidden={!settings.showInBuddies} onNavigate={navigate} />
  } else if (page === 'sessions') {
    content = (
      <StudySessions
        tab={sessionsTab}
        onTab={setSessionsTab}
        currentUser={currentUser}
        sessions={visibleSessions}
        selectedStyles={selectedStyles}
        professorQuery={professorQuery}
        courseFilter={courseFilter}
        courses={courses}
        onToggleStyle={toggleStyle}
        onProfessorQuery={setProfessorQuery}
        onCourseFilter={setCourseFilter}
        onClearFilters={clearFilters}
        onJoin={requestJoin}
        onLeave={setLeavingId}
        onEnd={setEndingId}
        onOpen={setOpenId}
        conflictsFor={conflictsFor}
        hideConflicts={settings.hideConflicts}
        onCreate={() => setPage('create')}
      />
    )
  } else if (page === 'profile') {
    content = (
      <Profile
        currentUser={currentUser}
        profile={profile}
        onSaveProfile={saveProfile}
        visibility={settings.profileVisibility}
        courses={courses}
        sessions={visibleSessions}
        onAddCourse={addCourse}
        onRemoveCourse={removeCourse}
        onLeave={setLeavingId}
        onEnd={setEndingId}
        onOpen={setOpenId}
      />
    )
  } else if (page === 'settings') {
    content = (
      <Settings
        settings={settings}
        onChange={changeSetting}
        currentUser={currentUser}
        profile={profile}
        onNavigate={navigate}
        onDownloadData={downloadData}
        onResetSettings={() => setSettingsDialog('reset')}
        onDeleteAccount={() => setSettingsDialog('delete')}
      />
    )
  } else if (page === 'create') {
    content = (
      <CreateSession
        currentUser={currentUser}
        courses={courses}
        sessions={visibleSessions}
        settings={settings}
        savedPhone={savedPhone}
        onCancel={() => navigate('sessions')}
        onCreated={handleCreated}
      />
    )
  } else {
    content = (
      <Home
        currentUser={currentUser}
        photo={profile.photo}
        sessions={visibleSessions}
        selectedStyles={selectedStyles}
        professorQuery={professorQuery}
        courseFilter={courseFilter}
        courses={courses}
        onToggleStyle={toggleStyle}
        onProfessorQuery={setProfessorQuery}
        onCourseFilter={setCourseFilter}
        onClearFilters={clearFilters}
        onJoin={requestJoin}
        onLeave={setLeavingId}
        onEnd={setEndingId}
        onOpen={setOpenId}
        conflictsFor={conflictsFor}
        onNavigate={navigate}
        onAddCourse={addCourse}
        onRemoveCourse={removeCourse}
      />
    )
  }

  return (
    <AppShell currentPage={page} onNavigate={navigate} onLogout={logout} backdrop={settings.backdrop !== false}>
      {content}
      <SessionDrawer
        session={openSession}
        currentUser={currentUser}
        photo={profile.photo}
        conflicts={openSession ? conflictsFor(openSession) : []}
        onOpen={setOpenId}
        onClose={closeDrawer}
        onJoin={requestJoin}
        onLeave={setLeavingId}
        onEnd={setEndingId}
      />
      <ConfirmDialog
        open={Boolean(pendingJoin)}
        title="Join Anyway?"
        message={
          pendingJoin
            ? `The ${pendingJoin.course} session (${formatSessionWhen(pendingJoin.start, pendingJoin.end)}) ${describeConflicts(
                pendingConflicts,
                formatSessionWhen,
              ).replace(/^Overlaps/, 'overlaps')}. Is it okay to join even though the times conflict?`
            : ''
        }
        confirmLabel="Join Anyway"
        cancelLabel="Cancel"
        confirmTone="primary"
        illustration={<ThinkScene />}
        onCancel={() => setConflictId(null)}
        onConfirm={() => {
          setJoiningId(conflictId)
          setConflictId(null)
        }}
      />
      <PhoneDialog
        open={Boolean(joining)}
        course={joining?.course || ''}
        initialPhone={savedPhone}
        onCancel={closeJoin}
        onConfirm={(phone) => {
          rememberPhone(phone)
          joinSession(joiningId, phone)
          setJoiningId(null)
        }}
      />
      <Toast toast={toast} onDone={clearToast} />
      <ConfirmDialog
        open={Boolean(leaving)}
        title="Leave This Session?"
        message={
          leaving
            ? `Are you sure you want to leave the ${leaving.course} study session? Your spot will open up for another Anteater.`
            : ''
        }
        confirmLabel="Leave Session"
        cancelLabel="Stay"
        illustration={<WaveScene text="See ya!" />}
        onCancel={() => setLeavingId(null)}
        onConfirm={() => {
          leaveSession(leavingId)
          setLeavingId(null)
        }}
      />
      <ConfirmDialog
        open={settingsDialog === 'reset'}
        title="Reset Settings?"
        message="Every setting, including dark mode, will go back to its default. Your profile, courses and sessions won't change."
        confirmLabel="Reset Settings"
        cancelLabel="Cancel"
        confirmTone="primary"
        illustration={<ThinkScene />}
        onCancel={() => setSettingsDialog(null)}
        onConfirm={() => {
          setSettings(DEFAULT_SETTINGS)
          setSettingsDialog(null)
          notify('Settings were reset to their defaults.')
        }}
      />
      <ConfirmDialog
        open={settingsDialog === 'delete'}
        title="Delete Your Account?"
        message="This removes your profile, courses and sessions from ZotStudy and logs you out. This can't be undone."
        confirmLabel="Delete Account"
        cancelLabel="Keep My Account"
        illustration={<SleepScene />}
        onCancel={() => setSettingsDialog(null)}
        onConfirm={() => {
          // Erase this account's saved data so it doesn't come back next time.
          deletedRef.current = true
          const email = (profile.email || account?.email || '').toLowerCase()
          deleteAccount(accountId)
          if (email) deleteAccount(email)
          forgetOnboarded(accountId, email)
          try {
            window.localStorage.removeItem(ONBOARDING_KEY)
            window.localStorage.removeItem(PHONE_KEY)
          } catch {
            // Nothing to remove.
          }
          logout()
        }}
      />
      <ConfirmDialog
        open={Boolean(ending)}
        title="End This Session?"
        message={
          ending
            ? `Are you sure you want to end the ${ending.course} study session? It will be removed for everyone${
                endingOthers > 0
                  ? `, including the ${endingOthers} ${endingOthers === 1 ? 'Anteater' : 'Anteaters'} who joined`
                  : ''
              }. This can't be undone.`
            : ''
        }
        confirmLabel="End Session"
        cancelLabel="Keep It"
        illustration={<SleepScene />}
        onCancel={() => setEndingId(null)}
        onConfirm={() => {
          endSession(endingId)
          setEndingId(null)
        }}
      />
    </AppShell>
  )
}
