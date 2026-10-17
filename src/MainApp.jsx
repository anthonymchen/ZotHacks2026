import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { INITIAL_SESSIONS, EMPTY_PROFILE, DEFAULT_SETTINGS } from './data'
import AppShell from './components/AppShell'
import ConfirmDialog from './components/ConfirmDialog'
import SessionDrawer from './components/SessionDrawer'
import Toast from './components/Toast'
import { WaveScene, SleepScene, ThinkScene } from './components/Scenes'
import {
  findConflicts,
  describeConflicts,
  openAlternatives,
  waitlistPosition,
  isMember,
  normalizeCourse,
  hasEnded,
} from './sessions.js'
import { formatSessionWhen } from './time'
import { createSession as saveSessionToFirebase } from './lib/sessions'
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

export default function MainApp({ user = DEMO_USER, courses: initialCourses = DEMO_COURSES, onLogout }) {
  const [page, setPage] = useState('home')
  const [currentUser, setCurrentUser] = useState(user)
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [courses, setCourses] = useState(initialCourses)
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [selectedStyles, setSelectedStyles] = useState([])
  const [professorQuery, setProfessorQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [leavingId, setLeavingId] = useState(null)
  const leaving = sessions.find((session) => session.id === leavingId)
  const [endingId, setEndingId] = useState(null)
  const ending = sessions.find((session) => session.id === endingId)
  const endingOthers = ending ? ending.attendees.filter((name) => name !== currentUser).length : 0
  const [sessionsTab, setSessionsTab] = useState('all')
  const [openId, setOpenId] = useState(null)
  const [conflictId, setConflictId] = useState(null)
  const [waitLeavingId, setWaitLeavingId] = useState(null)
  const waitLeaving = sessions.find((session) => session.id === waitLeavingId)
  const [toast, setToast] = useState(null)
  const [settings, setSettings] = useState(loadSettings)
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
      waitlisted: sessions.filter((session) => (session.waitlist || []).includes(currentUser)),
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
  // take (plus anything they're hosting, joined or waiting on).
  const myCourseKeys = courses.map(normalizeCourse)
  const visibleSessions = sessions.filter(
    (session) =>
      !hasEnded(session, now) &&
      (isMember(session, currentUser) ||
        (session.waitlist || []).includes(currentUser) ||
        myCourseKeys.includes(normalizeCourse(session.course))),
  )

  const conflictsFor = (session) => findConflicts(session, visibleSessions, currentUser)
  const pendingJoin = sessions.find((session) => session.id === conflictId)
  const pendingConflicts = pendingJoin ? conflictsFor(pendingJoin) : []
  const openSession = sessions.find((session) => session.id === openId)

  function logout() {
    setSettingsDialog(null)
    setProfile(EMPTY_PROFILE)
    setCourses(initialCourses)
    setSessions(INITIAL_SESSIONS)
    setCurrentUser(user)
    setSessionsTab('all')
    setOpenId(null)
    setConflictId(null)
    setWaitLeavingId(null)
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
    setCourses((prev) => (prev.includes(course) ? prev : [...prev, course]))
  }

  function removeCourse(course) {
    setCourses((prev) => prev.filter((item) => item !== course))
  }

  function saveProfile({ name, ...details }) {
    const oldName = currentUser
    if (name !== oldName) {
      // Keep the user's joined and hosted sessions linked to the new name.
      const rename = (person) => (person === oldName ? name : person)
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
  }

  function leaveSession(sessionId) {
    const target = sessions.find((session) => session.id === sessionId)
    if (!target) return
    const attendees = target.attendees.filter((name) => name !== currentUser)
    const waitlist = [...(target.waitlist || [])]
    // A spot just opened: the next person on the waitlist moves in.
    const promoted = waitlist.length > 0 && attendees.length < target.capacity ? waitlist.shift() : null
    if (promoted) attendees.push(promoted)
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, attendees, waitlist } : session)),
    )
    if (promoted && (settings.waitlistAlerts || promoted === currentUser)) {
      setToast({
        id: Date.now(),
        message:
          promoted === currentUser
            ? `A spot opened up in ${target.course}. You're in!`
            : `${promoted} moved up from the waitlist and took the open spot in ${target.course}.`,
      })
    }
  }

  function joinWaitlist(sessionId) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId &&
        !isMember(session, currentUser) &&
        !(session.waitlist || []).includes(currentUser)
          ? { ...session, waitlist: [...(session.waitlist || []), currentUser] }
          : session,
      ),
    )
  }

  function leaveWaitlist(sessionId) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, waitlist: (session.waitlist || []).filter((name) => name !== currentUser) }
          : session,
      ),
    )
  }

  const closeDrawer = useCallback(() => setOpenId(null), [])

  function endSession(sessionId) {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
  }

  // Joining a session that clashes with one you're in asks first.
  function requestJoin(sessionId) {
    const target = sessions.find((session) => session.id === sessionId)
    if (target && conflictsFor(target).length > 0) {
      setConflictId(sessionId)
      return
    }
    joinSession(sessionId)
  }

  function joinSession(sessionId) {
    setSessions((prev) =>
      prev.map((session) => {
        if (
          session.id !== sessionId ||
          isMember(session, currentUser) ||
          session.attendees.length >= session.capacity
        ) {
          return session
        }
        return { ...session, attendees: [...session.attendees, currentUser] }
      }),
    )
  }

  // Going to Study Sessions always opens on the All Sessions tab.
  function navigate(next) {
    if (next === 'sessions') setSessionsTab('all')
    setPage(next)
  }

  function handleCreated(session) {
    // Save to the "sessions" collection in Firebase. The session shows up
    // right away; if saving fails it stays on this device and we say so.
    saveSessionToFirebase(session)
      .then((firebaseId) => {
        setSessions((prev) => prev.map((item) => (item.id === session.id ? { ...item, firebaseId } : item)))
        notify(`Your ${session.course} session was saved.`)
      })
      .catch((error) => {
        console.error('Could not save session to Firebase', error)
        notify("Couldn't save your session to the server. It's only on this device for now.")
      })
    setSessions((prev) => [session, ...prev])
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
        onWaitlist={joinWaitlist}
        onLeaveWaitlist={setWaitLeavingId}
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
        onWaitlist={joinWaitlist}
        onLeaveWaitlist={setWaitLeavingId}
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
        onWaitlist={joinWaitlist}
        onLeaveWaitlist={setWaitLeavingId}
        conflictsFor={conflictsFor}
        onNavigate={navigate}
        onAddCourse={addCourse}
        onRemoveCourse={removeCourse}
      />
    )
  }

  return (
    <AppShell currentPage={page} onNavigate={navigate} onLogout={logout}>
      {content}
      <SessionDrawer
        session={openSession}
        currentUser={currentUser}
        photo={profile.photo}
        conflicts={openSession ? conflictsFor(openSession) : []}
        alternatives={openSession ? openAlternatives(openSession, visibleSessions, currentUser) : []}
        onOpen={setOpenId}
        onWaitlist={joinWaitlist}
        onLeaveWaitlist={setWaitLeavingId}
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
          joinSession(conflictId)
          setConflictId(null)
        }}
      />
      <ConfirmDialog
        open={Boolean(waitLeaving)}
        title="Leave the Waitlist?"
        message={
          waitLeaving
            ? `You're #${waitlistPosition(waitLeaving, currentUser)} in line for the ${waitLeaving.course} study session. If you leave, you'll lose your place.`
            : ''
        }
        confirmLabel="Leave Waitlist"
        cancelLabel="Stay in Line"
        illustration={<ThinkScene />}
        onCancel={() => setWaitLeavingId(null)}
        onConfirm={() => {
          leaveWaitlist(waitLeavingId)
          setWaitLeavingId(null)
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
          setSettings(DEFAULT_SETTINGS)
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
