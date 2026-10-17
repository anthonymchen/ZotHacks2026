import { useState } from 'react'
import { STUDY_BUDDIES } from '../data'
import Avatar from '../components/Avatar'
import PageBanner from '../components/PageBanner'
import { HugScene } from '../components/Scenes'

const BAND_TONES = ['navy', 'gold', 'sky', 'cream']

export default function StudyBuddies({ courses, hidden = false, onNavigate }) {
  const [requested, setRequested] = useState([])

  // Buddies who share the most courses with you come first.
  const buddies = STUDY_BUDDIES.map((buddy) => ({
    ...buddy,
    shared: buddy.courses.filter((course) => courses.includes(course)),
  })).sort((a, b) => b.shared.length - a.shared.length)
  const matches = buddies.filter((buddy) => buddy.shared.length > 0).length

  function toggleRequest(id) {
    setRequested((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <main className="dashboard">
      <PageBanner
        eyebrow="Study buddies"
        title="Find Study Buddies"
        subtitle="Search by course and connect with other Anteaters."
        stats={[
          { value: matches, label: matches === 1 ? 'Buddy Shares Your Courses' : 'Buddies Share Your Courses' },
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

      <div className="buddy-grid">
        {buddies.map((buddy, index) => {
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
                    : 'No shared courses yet'}
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
                  {isRequested ? '✓ Requested' : 'Connect'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
