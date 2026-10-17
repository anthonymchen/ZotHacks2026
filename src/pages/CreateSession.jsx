import { useState } from 'react'
import { LOCATIONS, STYLES, MAX_GROUP_SIZE } from '../data'
import { validateSession, overlaps, describeConflicts, isMember, formatPhone } from '../sessions.js'
import { formatSessionWhen } from '../time'
import PageBanner from '../components/PageBanner'
import SessionCard from '../components/SessionCard'
import DateTimeField from '../components/DateTimeField'
import ConfirmDialog from '../components/ConfirmDialog'
import { PlanScene, ThinkScene } from '../components/Scenes'

function toIso(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

// "YYYY-MM-DDTHH:MM" in local time, the format the date/time pickers use.
function toLocalValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function nextHour() {
  const date = new Date()
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return toLocalValue(date)
}

function timeAfter(value, minutes = 60) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  date.setMinutes(date.getMinutes() + minutes)
  return toLocalValue(date)
}

function dayTile(iso) {
  const date = new Date(iso)
  return {
    month: date.toLocaleDateString(undefined, { month: 'short' }),
    day: date.getDate(),
  }
}

export default function CreateSession({
  currentUser,
  courses = [],
  sessions = [],
  settings = {},
  savedPhone = '',
  onCancel,
  onCreated,
}) {
  const length = settings.defaultLength || 60
  const [form, setForm] = useState({
    course: courses[0] || '',
    location: LOCATIONS.includes(settings.defaultLocation) ? settings.defaultLocation : LOCATIONS[0],
    start: '',
    end: '',
    style: STYLES.includes(settings.defaultStyle) ? settings.defaultStyle : STYLES[0],
    professor: '',
    hostName: currentUser,
    hostPhone: savedPhone,
  })
  const [errors, setErrors] = useState({})
  const [confirmingClash, setConfirmingClash] = useState(false)

  // Sessions you're already in (joined or hosting), soonest first.
  const mySessions = sessions
    .filter((session) => isMember(session, currentUser))
    .sort((a, b) => new Date(a.start) - new Date(b.start))
  const draftTimes = { start: toIso(form.start), end: toIso(form.end) }
  const timesReady = Boolean(draftTimes.start && draftTimes.end) && new Date(form.end) > new Date(form.start)
  const clashes = timesReady ? mySessions.filter((session) => overlaps(draftTimes, session)) : []

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateSession(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    // Overlapping times are allowed, but ask first.
    if (clashes.length > 0) {
      setConfirmingClash(true)
      return
    }
    createSession()
  }

  function createSession() {
    const hostName = form.hostName.trim()
    const hostPhone = formatPhone(form.hostPhone)
    const session = {
      id: crypto.randomUUID(),
      course: form.course.trim(),
      location: form.location,
      start: new Date(form.start).toISOString(),
      end: new Date(form.end).toISOString(),
      style: form.style,
      tags: [form.style],
      professor: form.professor.trim(),
      hostName,
      hostPhone,
      contacts: [{ name: hostName, phone: hostPhone }],
      attendees: [],
      ownerName: currentUser,
      capacity: MAX_GROUP_SIZE,
      waitlist: [],
    }

    console.log('Created session:', session)
    onCreated(session)
  }

  const previewHost = form.hostName.trim() || 'You'
  const preview = {
    id: 'preview',
    course: form.course.trim() || 'Your course',
    location: form.location,
    start: toIso(form.start),
    end: toIso(form.end),
    style: form.style,
    tags: [form.style],
    professor: form.professor.trim(),
    hostName: previewHost,
    attendees: [],
    capacity: MAX_GROUP_SIZE,
  }

  return (
    <main className="dashboard">
      <PageBanner
        eyebrow="Host a session"
        title="Create a Study Session"
        subtitle="Share a time and place so other Anteaters can join."
        art={<PlanScene />}
      />
      <div className="create-layout">
        <form className="form-panel create-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="form-section">
            <legend>
              <span className="step">1</span> What You're Studying
            </legend>
            <label htmlFor="course">Course</label>
            <input
              id="course"
              value={form.course}
              onChange={(event) => update('course', event.target.value)}
              placeholder="e.g. ICS 31"
              list="my-courses"
              aria-invalid={Boolean(errors.course)}
            />
            <datalist id="my-courses">
              {courses.map((course) => (
                <option key={course} value={course} />
              ))}
            </datalist>
            {errors.course ? <p className="error">{errors.course}</p> : null}

            <div className="two-col">
              <div>
                <label htmlFor="style">Style</label>
                <select id="style" value={form.style} onChange={(event) => update('style', event.target.value)}>
                  {STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="professor">Professor (Optional)</label>
                <input
                  id="professor"
                  value={form.professor}
                  onChange={(event) => update('professor', event.target.value)}
                  placeholder="e.g. Pattis"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>
              <span className="step">2</span> When and Where
            </legend>
            <div className="two-col">
              <div>
                <DateTimeField
                  id="start"
                  label="Start"
                  value={form.start}
                  suggest={nextHour()}
                  invalid={Boolean(errors.start)}
                  onChange={(value) => update('start', value)}
                />
                {errors.start ? <p className="error">{errors.start}</p> : null}
              </div>
              <div>
                <DateTimeField
                  id="end"
                  label="End"
                  value={form.end}
                  suggest={timeAfter(form.start, length) || nextHour()}
                  invalid={Boolean(errors.end)}
                  validate={(value) =>
                    form.start && new Date(value) <= new Date(form.start) ? 'End time must be after start time.' : ''
                  }
                  onChange={(value) => update('end', value)}
                />
                {errors.end ? <p className="error">{errors.end}</p> : null}
              </div>
            </div>
            {clashes.length > 0 ? (
              <div className="conflict-box" role="status">
                <strong>
                  <span aria-hidden="true">⚠</span> Time Conflict
                </strong>
                <p>{describeConflicts(clashes, formatSessionWhen)}. You can still create this session.</p>
              </div>
            ) : null}
            <label htmlFor="location">Location</label>
            <select id="location" value={form.location} onChange={(event) => update('location', event.target.value)}>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="form-section">
            <legend>
              <span className="step">3</span> Who's Hosting
            </legend>
            <label htmlFor="hostName">Host Name</label>
            <input
              id="hostName"
              value={form.hostName}
              onChange={(event) => update('hostName', event.target.value)}
              aria-invalid={Boolean(errors.hostName)}
            />
            {errors.hostName ? <p className="error">{errors.hostName}</p> : null}
            <label htmlFor="hostPhone">Phone Number</label>
            <input
              id="hostPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(949) 555-0123"
              value={form.hostPhone}
              onChange={(event) => update('hostPhone', event.target.value)}
              aria-invalid={Boolean(errors.hostPhone)}
            />
            {errors.hostPhone ? <p className="error">{errors.hostPhone}</p> : null}
            <p className="hint">Only people who join your session can see your number.</p>
            <p className="hint">Groups hold up to {MAX_GROUP_SIZE} people, including you.</p>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="ghost" onClick={onCancel}>
              Back
            </button>
            <button type="submit">Create Session</button>
          </div>
        </form>

        <div className="create-side">
          <aside className="create-preview" aria-label="Live preview">
            <p className="eyebrow">Live Preview</p>
            <SessionCard session={preview} currentUser={previewHost} onJoin={() => {}} />
            <p className="hint">This is how your session will look to other Anteaters.</p>
          </aside>

          <aside className="my-schedule" aria-label="Sessions you're in">
            <p className="eyebrow">
              Sessions You're In <span className="tab-count">{mySessions.length}</span>
            </p>
            {mySessions.length === 0 ? (
              <p className="hint">You're not in any sessions yet, so any time works.</p>
            ) : (
              <ul className="schedule-list">
                {mySessions.map((session) => {
                  const tile = dayTile(session.start)
                  const clash = clashes.some((other) => other.id === session.id)
                  return (
                    <li key={session.id} className={`schedule-item${clash ? ' clash' : ''}`} data-style={session.style}>
                      <span className="day-tile" aria-hidden="true">
                        <span>{tile.month}</span>
                        <strong>{tile.day}</strong>
                      </span>
                      <span className="schedule-text">
                        <strong>{session.course}</strong>
                        <span>{formatSessionWhen(session.start, session.end)}</span>
                        <span className="schedule-place">{session.location}</span>
                      </span>
                      <span className="schedule-badges">
                        <span className="person-badge you">
                          {session.hostName === currentUser ? 'Hosting' : 'Joined'}
                        </span>
                        {clash ? <span className="person-badge overlap">Overlaps</span> : null}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingClash}
        title="Create Anyway?"
        message={
          confirmingClash
            ? `This session (${formatSessionWhen(draftTimes.start, draftTimes.end)}) ${describeConflicts(
                clashes,
                formatSessionWhen,
              ).replace(/^Overlaps/, 'overlaps')}. Is it okay to create it even though the times conflict?`
            : ''
        }
        confirmLabel="Create Anyway"
        cancelLabel="Cancel"
        confirmTone="primary"
        illustration={<ThinkScene />}
        onCancel={() => setConfirmingClash(false)}
        onConfirm={() => {
          setConfirmingClash(false)
          createSession()
        }}
      />
    </main>
  )
}
