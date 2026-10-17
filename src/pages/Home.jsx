import { useState } from 'react'
import Avatar from '../components/Avatar'
import { filterSessions, courseOptions } from '../sessions.js'
import { BuddiesIcon, SessionsIcon } from '../components/Icons'
import SessionCard from '../components/SessionCard'
import SessionFilters from '../components/SessionFilters'
import EmptyState from '../components/EmptyState'
import { WaveScene } from '../components/Scenes'

const ACTIONS = [
  {
    page: 'buddies',
    tone: 'purple',
    Icon: BuddiesIcon,
    title: 'Find Study Buddies',
    blurb: 'Search by course and connect',
  },
  {
    page: 'sessions',
    tone: 'blue',
    Icon: SessionsIcon,
    title: 'Join a Study Session',
    blurb: 'Browse upcoming study sessions',
  },
]

export default function Home({
  currentUser,
  photo,
  courses,
  sessions,
  selectedStyles,
  professorQuery,
  courseFilter,
  onToggleStyle,
  onProfessorQuery,
  onCourseFilter,
  onClearFilters,
  onJoin,
  onLeave,
  onEnd,
  onOpen,
  conflictsFor,
  onNavigate,
  onAddCourse,
  onRemoveCourse,
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const filtered = filterSessions(sessions, selectedStyles, professorQuery, courseFilter)
  const firstName = currentUser.split(' ')[0]
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  function addCourse() {
    const next = draft.trim()
    if (next) onAddCourse(next)
    setDraft('')
    setAdding(false)
  }

  return (
    <main className="dashboard">
      <header className="welcome">
        <div>
          <p className="eyebrow">{today}</p>
          <h1>Welcome Back, {firstName}! 👋</h1>
          <p>Find study buddies or join a study session.</p>
        </div>
        <button
          type="button"
          className="avatar-button"
          title="My Profile"
          onClick={() => onNavigate('profile')}
        >
          <Avatar name={currentUser} photo={photo} />
        </button>
        <div className="welcome-critter">
          <WaveScene />
        </div>
      </header>

      <section className="action-grid">
        {ACTIONS.map(({ page, tone, Icon, title, blurb }) => (
          <button
            key={page}
            type="button"
            className={`action-card ${tone}`}
            onClick={() => onNavigate(page)}
          >
            <span className="action-icon">
              <Icon />
            </span>
            <strong>{title}</strong>
            <span>{blurb}</span>
          </button>
        ))}
      </section>

      <section className="panel-block">
        <div className="section-head">
          <h2>Your Courses</h2>
          <button type="button" className="pill-link" onClick={() => onNavigate('profile')}>
            Manage
          </button>
        </div>
        <div className="course-editor">
          {courses.map((course) => (
            <span key={course} className="course-chip">
              {course}
              <button
                type="button"
                className="chip-x"
                aria-label={`Remove ${course}`}
                onClick={() => onRemoveCourse(course)}
              >
                ×
              </button>
            </span>
          ))}
          {adding ? (
            <form
              className="add-course"
              onSubmit={(event) => {
                event.preventDefault()
                addCourse()
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={addCourse}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setDraft('')
                    setAdding(false)
                  }
                }}
                placeholder="e.g. ICS 46"
                aria-label="New course"
              />
            </form>
          ) : (
            <button type="button" className="add-course-btn" onClick={() => setAdding(true)}>
              + Add Course
            </button>
          )}
        </div>
      </section>

      <section className="panel-block">
        <div className="section-head">
          <h2>Upcoming Sessions</h2>
          <div className="head-actions">
            <button type="button" className="pill-link" onClick={() => onNavigate('create')}>
              + Create
            </button>
            <button type="button" className="pill-link" onClick={() => onNavigate('sessions')}>
              View All
            </button>
          </div>
        </div>
        <SessionFilters
          selectedStyles={selectedStyles}
          professorQuery={professorQuery}
          courseFilter={courseFilter}
          courseOptions={courseOptions(sessions, courses)}
          onToggleStyle={onToggleStyle}
          onProfessorQuery={onProfessorQuery}
          onCourseFilter={onCourseFilter}
          onClear={onClearFilters}
        />
        {filtered.length === 0 ? (
          <EmptyState
            title="No sessions match those filters."
            hint="Even our anteater can't sniff one out. Try clearing a filter or create your own."
          />
        ) : (
          <div className="session-list">
            {filtered.slice(0, 3).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUser={currentUser}
                onJoin={onJoin}
                onLeave={onLeave}
                onEnd={onEnd}
                onOpen={onOpen}
                conflicts={conflictsFor ? conflictsFor(session) : []}
                compact
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
