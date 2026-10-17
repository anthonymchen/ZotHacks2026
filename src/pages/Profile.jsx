import { isMember, isHost } from '../sessions.js'
import { useEffect, useRef, useState } from 'react'
import { SUGGESTED_COURSES, STYLES, YEARS } from '../data'
import Avatar from '../components/Avatar'
import PageBanner from '../components/PageBanner'
import EmptyState from '../components/EmptyState'
import { GradScene } from '../components/Scenes'
import { formatSessionWhen } from '../time'

const NAME_MAX = 40
const BIO_MAX = 160
const PHOTO_MAX_MB = 5

// Shrink and center-crop an uploaded image to a small square so it stays light.
function readPhoto(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That file is not a valid image.'))
      img.onload = () => {
        const side = Math.min(img.width, img.height)
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        canvas
          .getContext('2d')
          .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

function validateProfile(form) {
  const errors = {}
  const name = form.name.trim()
  if (!name) errors.name = 'Name cannot be empty.'
  else if (name.length > NAME_MAX) errors.name = `Name must be ${NAME_MAX} characters or fewer.`
  if (form.bio.length > BIO_MAX) errors.bio = `Bio must be ${BIO_MAX} characters or fewer.`
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  return errors
}

function ProfileEditor({ currentUser, profile, onSave, onCancel }) {
  const [form, setForm] = useState({ name: currentUser, ...profile })
  const [errors, setErrors] = useState({})
  const [photoError, setPhotoError] = useState('')
  const fileRef = useRef(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handlePhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file (JPG, PNG, GIF or WebP).')
      return
    }
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) {
      setPhotoError(`Please choose an image under ${PHOTO_MAX_MB} MB.`)
      return
    }
    try {
      update('photo', await readPhoto(file))
      setPhotoError('')
    } catch (error) {
      setPhotoError(error.message)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateProfile(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSave({
      ...form,
      name: form.name.trim(),
      pronouns: form.pronouns.trim(),
      major: form.major.trim(),
      bio: form.bio.trim(),
      email: form.email.trim(),
      discord: form.discord.trim(),
    })
  }

  return (
    <form className="panel-block profile-form" onSubmit={handleSubmit} noValidate>
      <h2>Edit Profile</h2>

      <div className="photo-row">
        <Avatar name={form.name} photo={form.photo} size="xlarge" />
        <div className="photo-actions">
          <div className="photo-buttons">
            <button type="button" className="primary" onClick={() => fileRef.current?.click()}>
              {form.photo ? 'Change Photo' : 'Upload Photo'}
            </button>
            {form.photo ? (
              <button type="button" className="ghost" onClick={() => update('photo', '')}>
                Remove
              </button>
            ) : null}
          </div>
          <p className="hint">JPG, PNG, GIF or WebP, up to {PHOTO_MAX_MB} MB. It will be cropped to a square.</p>
          {photoError ? <p className="error">{photoError}</p> : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhoto}
            data-testid="photo-input"
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="p-name">Name</label>
          <input
            id="p-name"
            value={form.name}
            maxLength={NAME_MAX + 10}
            onChange={(event) => update('name', event.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="error">{errors.name}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="p-pronouns">Pronouns (Optional)</label>
          <input
            id="p-pronouns"
            value={form.pronouns}
            onChange={(event) => update('pronouns', event.target.value)}
            placeholder="e.g. she/her"
          />
        </div>

        <div className="field">
          <label htmlFor="p-major">Major</label>
          <input
            id="p-major"
            value={form.major}
            onChange={(event) => update('major', event.target.value)}
            placeholder="e.g. Computer Science"
          />
        </div>

        <div className="field">
          <label htmlFor="p-year">Year</label>
          <select id="p-year" value={form.year} onChange={(event) => update('year', event.target.value)}>
            <option value="">Select Your Year</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="p-style">Preferred Study Style</label>
          <select
            id="p-style"
            value={form.studyStyle}
            onChange={(event) => update('studyStyle', event.target.value)}
          >
            <option value="">No Preference</option>
            {STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="p-email">Email (Optional)</label>
          <input
            id="p-email"
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="you@uci.edu"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="error">{errors.email}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="p-discord">Discord (Optional)</label>
          <input
            id="p-discord"
            value={form.discord}
            onChange={(event) => update('discord', event.target.value)}
            placeholder="e.g. peter.anteater"
          />
        </div>

        <div className="field full">
          <label htmlFor="p-bio">Bio</label>
          <textarea
            id="p-bio"
            rows={3}
            value={form.bio}
            onChange={(event) => update('bio', event.target.value)}
            placeholder="What are you studying for? When do you like to study?"
            aria-invalid={Boolean(errors.bio)}
          />
          <p className={`hint counter${form.bio.length > BIO_MAX ? ' over' : ''}`}>
            {form.bio.length}/{BIO_MAX}
          </p>
          {errors.bio ? <p className="error">{errors.bio}</p> : null}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary">
          Save Changes
        </button>
      </div>
    </form>
  )
}

const VISIBILITY_LABELS = {
  everyone: '🌐 Visible to Everyone',
  classmates: '👥 Visible to Classmates',
  private: '🔒 Only You Can See This',
}

export default function Profile({
  currentUser,
  profile,
  onSaveProfile,
  visibility = 'classmates',
  courses,
  sessions,
  onAddCourse,
  onRemoveCourse,
  onLeave,
  onEnd,
  onOpen,
}) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draft, setDraft] = useState('')
  const joined = sessions
    .filter((session) => isMember(session, currentUser))
    .sort((a, b) => new Date(a.start) - new Date(b.start))
  const hosting = sessions.filter((session) => isHost(session, currentUser))

  useEffect(() => {
    if (!saved) return undefined
    const timer = setTimeout(() => setSaved(false), 3000)
    return () => clearTimeout(timer)
  }, [saved])

  function handleAdd(event) {
    event.preventDefault()
    const next = draft.trim()
    if (!next) return
    onAddCourse(next)
    setDraft('')
  }

  const subtitle = [profile.pronouns, profile.major, profile.year].filter(Boolean).join(' · ')

  return (
    <main className="dashboard">
      <PageBanner
        eyebrow="Your account"
        title="My Profile"
        subtitle="Your courses, sessions, and study style live here."
        stats={[
          { value: courses.length, label: courses.length === 1 ? 'Course' : 'Courses' },
          { value: joined.length, label: 'Joined' },
          { value: hosting.length, label: 'Hosting' },
        ]}
        art={<GradScene />}
      />

      {saved ? (
        <p className="toast" role="status">
          ✓ Profile updated
        </p>
      ) : null}

      {editing ? (
        <ProfileEditor
          currentUser={currentUser}
          profile={profile}
          onCancel={() => setEditing(false)}
          onSave={(next) => {
            onSaveProfile(next)
            setEditing(false)
            setSaved(true)
          }}
        />
      ) : (
        <section className="panel-block profile-card">
          <div className="profile-cover" aria-hidden="true" />
          <span className="profile-avatar">
            <Avatar name={currentUser} photo={profile.photo} size="xlarge" />
          </span>
          <div className="profile-info">
            <h2>{currentUser}</h2>
            {subtitle ? <p className="profile-sub">{subtitle}</p> : null}
            {profile.bio ? (
              <p className="profile-bio">{profile.bio}</p>
            ) : (
              <p className="empty">Add a bio so study buddies know what you're working on.</p>
            )}
            <div className="tag-row">
              <span className="tag visibility-tag" title="Change this in Settings">
                {VISIBILITY_LABELS[visibility] || VISIBILITY_LABELS.classmates}
              </span>
              {profile.studyStyle ? <span className="tag">Prefers: {profile.studyStyle}</span> : null}
            </div>
            {profile.email || profile.discord ? (
              <ul className="contact-list">
                {profile.email ? <li>✉ {profile.email}</li> : null}
                {profile.discord ? <li>💬 {profile.discord}</li> : null}
              </ul>
            ) : null}
          </div>
          <button type="button" className="primary edit-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </section>
      )}

      <section className="panel-block">
        <h2>Manage Courses</h2>
        <div className="course-editor">
          {courses.length === 0 ? <p className="empty">No courses yet.</p> : null}
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
        </div>
        <form className="add-row" onSubmit={handleAdd}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="e.g. ICS 46"
            list="profile-course-suggestions"
            aria-label="Add a course"
          />
          <datalist id="profile-course-suggestions">
            {SUGGESTED_COURSES.map((course) => (
              <option key={course} value={course} />
            ))}
          </datalist>
          <button type="submit" className="primary" disabled={!draft.trim()}>
            Add Course
          </button>
        </form>
      </section>

      <section className="panel-block">
        <h2>Sessions You Joined</h2>
        {joined.length === 0 ? (
          <EmptyState
            compact
            title="You have not joined a session yet."
            hint="Head to Study Sessions to find a group."
          />
        ) : (
          <ul className="joined-list">
            {joined.map((session) => (
              <li key={session.id} className="joined-row" data-style={session.style}>
                <span className="day-tile" aria-hidden="true">
                  <span>{new Date(session.start).toLocaleDateString(undefined, { month: 'short' })}</span>
                  <strong>{new Date(session.start).getDate()}</strong>
                </span>
                <span className="row-main">
                  {onOpen ? (
                    <button type="button" className="row-link" onClick={() => onOpen(session.id)}>
                      {session.course} Study Session
                    </button>
                  ) : (
                    <strong>{session.course} Study Session</strong>
                  )}
                  <span className="row-when">{formatSessionWhen(session.start, session.end)}</span>
                  <span className="row-place">
                    {session.location}
                    {session.hostName === currentUser ? ' · You are hosting' : ''}
                  </span>
                </span>
                {session.hostName === currentUser && onEnd ? (
                  <button
                    type="button"
                    className="leave-btn end-btn"
                    aria-label={`End ${session.course} study session`}
                    onClick={() => onEnd(session.id)}
                  >
                    End Session
                  </button>
                ) : null}
                {session.hostName !== currentUser && onLeave ? (
                  <button
                    type="button"
                    className="leave-btn"
                    aria-label={`Leave ${session.course} study session`}
                    onClick={() => onLeave(session.id)}
                  >
                    Leave
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
