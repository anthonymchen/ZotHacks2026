import { useState } from 'react'
import { STUDY_BUDDIES } from '../data'
import Avatar from '../components/Avatar'
import PageBanner from '../components/PageBanner'
import EmptyState from '../components/EmptyState'
import { normalizeCourse } from '../sessions.js'
import { HugScene } from '../components/Scenes'

const BAND_TONES = ['navy', 'gold', 'sky', 'cream']

// "math 2b", "MATH 2B" and "ICS 31" / "I&C SCI 31" count as the same course.
const normalize = normalizeCourse

export default function StudyBuddies({ courses, hidden = false, onNavigate }) {
  const [requested, setRequested] = useState([])
  const [query, setQuery] = useState('')

  const myCourses = courses.map(normalize)
  // Everyone, with the courses they share with you; most shared first.
  const everyone = STUDY_BUDDIES.map((buddy) => ({
    ...buddy,
    shared: buddy.courses.filter((course) => myCourses.includes(normalize(course))),
  })).sort((a, b) => b.shared.length - a.shared.length || a.name.localeCompare(b.name))
  const recommended = everyone.filter((buddy) => buddy.shared.length > 0)

  // Searching looks through every student by name, course or study style.
  const plain = (text) => String(text).trim().replace(/\s+/g, ' ').toUpperCase()
  const term = plain(query)
  const searching = term.length > 0
  const results = searching
    ? everyone.filter((buddy) =>
        // Match from the start of a word, so "ics" finds ICS 31 but not Physics.
        [buddy.name, buddy.style, ...buddy.courses].some((field) => {
          const text = plain(field)
          return text.startsWith(term) || text.includes(` ${term}`)
        }),
      )
    : recommended

  function toggleRequest(id) {
    setRequested((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <main className="dashboard">
      <PageBanner
        eyebrow="Study buddies"
        title="Find Study Buddies"
        subtitle="Search by name or course and connect with other Anteaters."
        stats={[
          {
            value: recommended.length,
            label: recommended.length === 1 ? 'Buddy Shares Your Courses' : 'Buddies Share Your Courses',
          },
          { value: requested.length, label: requested.length === 1 ? 'Request Sent' : 'Requests Sent' },
        ]}
        art={<HugScene />}
      />

      {hidden ? (
        <p className="settings-banner-note" role="status">
          <span>You're hidden from Study Buddies, so classmates can't find you here. You can still send requests.</span>
          {onNavigate ? (
            <button type="button" className="ghost" onClick={() => onNavigate('settings')}>
              Change in Settings
            </button>
          ) : null}
        </p>
      ) : null}

      <div className="buddy-search" role="search">
        <label htmlFor="buddy-search-input" className="sr-only">
          Search students
        </label>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 3a7 7 0 0 1 5.6 11.2l4.6 4.6-1.4 1.4-4.6-4.6A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
        </svg>
        <input
          id="buddy-search-input"
          type="search"
          placeholder="Search all students by name, course or study style"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('')
          }}
        />
        {searching ? (
          <button type="button" className="buddy-search-clear" onClick={() => setQuery('')}>
            Clear
          </button>
        ) : null}
      </div>

      <p className="list-label buddy-list-label" aria-live="polite">
        {searching ? `Results for \u201c${query.trim()}\u201d` : 'Recommended For You'}
        <span className="tab-count">{results.length}</span>
      </p>
      {!searching && recommended.length > 0 ? (
        <p className="buddy-hint">Students who share at least one of your classes. Use the search bar to find anyone else.</p>
      ) : null}

      {results.length === 0 ? (
        <EmptyState
          title={searching ? `No students match \u201c${query.trim()}\u201d.` : 'No classmates share your courses yet.'}
          hint={
            searching
              ? 'Try a different name or a course code like ICS 31.'
              : courses.length
                ? 'Use the search bar above to find students in other classes.'
                : 'Add your courses on the Home or Profile page to get recommendations.'
          }
        />
      ) : (
        <div className="buddy-grid">
          {results.map((buddy, index) => {
            const isRequested = requested.includes(buddy.id)
            return (
              <article key={buddy.id} className="buddy-card">
                <div className={`buddy-band ${BAND_TONES[index % BAND_TONES.length]}`} />
                <div className="buddy-body">
                  <span className="buddy-avatar">
                    <Avatar name={buddy.name} />
                  </span>
                  <h3>{buddy.name}</h3>
                  <p className="buddy-style">
                    <span className="style-dot" data-style={buddy.style} />
                    {buddy.style}
                  </p>
                  <p className="buddy-shared">
                    {buddy.shared.length > 0
                      ? `${buddy.shared.length} shared course${buddy.shared.length === 1 ? '' : 's'}`
                      : 'No shared courses'}
                  </p>
                  <div className="tag-row">
                    {buddy.courses.map((course) => (
                      <span key={course} className={`tag${buddy.shared.includes(course) ? ' shared' : ''}`}>
                        {course}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`primary connect-btn${isRequested ? ' requested' : ''}`}
                    aria-pressed={isRequested}
                    onClick={() => toggleRequest(buddy.id)}
                  >
                    {isRequested ? '\u2713 Requested' : 'Connect'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
