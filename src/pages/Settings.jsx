import PageBanner from '../components/PageBanner'
import Switch from '../components/Switch'
import { TinkerScene } from '../components/Scenes'
import { LOCATIONS, STYLES, SESSION_LENGTHS, REMINDER_TIMES, VISIBILITY_OPTIONS } from '../data'

const SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'study', label: 'Study Preferences' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'account', label: 'Account' },
]

const Sun = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" strokeWidth="2" stroke="currentColor" strokeLinecap="round" />
  </svg>
)

const Moon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
)

// One labelled row: text on the left, control on the right.
function Row({ title, description, htmlFor, children, disabled = false }) {
  return (
    <div className={`setting-row${disabled ? ' disabled' : ''}`}>
      <div className="setting-text">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="setting-title">
            {title}
          </label>
        ) : (
          <span className="setting-title">{title}</span>
        )}
        {description ? <span className="setting-desc">{description}</span> : null}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  )
}

function Select({ id, value, options, onChange, disabled = false }) {
  return (
    <select id={id} className="setting-select" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => {
        const opt = typeof option === 'string' ? { value: option, label: option } : option
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )
      })}
    </select>
  )
}

export default function Settings({
  settings,
  onChange,
  currentUser,
  profile,
  onNavigate,
  onDownloadData,
  onResetSettings,
  onDeleteAccount,
}) {
  const set = (key) => (value) => onChange(key, value)
  const dark = settings.theme === 'dark'

  function jump(id) {
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: settings.reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <main className="dashboard">
      <PageBanner
        eyebrow="Account"
        title="Settings"
        subtitle="Make ZotStudy work the way you like. Changes save automatically."
        art={<TinkerScene />}
      />

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map((section) => (
            <button key={section.id} type="button" onClick={() => jump(section.id)}>
              {section.label}
            </button>
          ))}
        </nav>

        <div className="settings-sections">
          <section className="panel-block settings-card" id="settings-appearance">
            <h2>Appearance</h2>
            <Row
              title="Dark Mode"
              description={dark ? 'Dark mode is on. Easier on the eyes for late-night studying.' : 'Switch to a darker look for late-night studying.'}
            >
              <span className="mode-label" aria-hidden="true">
                {dark ? 'Dark' : 'Light'}
              </span>
              <Switch
                checked={dark}
                label="Dark mode"
                onIcon={<Moon />}
                offIcon={<Sun />}
                onChange={(on) => onChange('theme', on ? 'dark' : 'light')}
              />
            </Row>
            <Row title="Reduce Motion" description="Turn off animations like the twinkling lightbulb and the spinning gear.">
              <Switch checked={settings.reduceMotion} label="Reduce motion" onChange={set('reduceMotion')} />
            </Row>
          </section>

          <section className="panel-block settings-card" id="settings-notifications">
            <h2>Notifications</h2>
            <Row title="Session Reminders" description="Get a reminder before sessions you joined or are hosting.">
              <Switch checked={settings.sessionReminders} label="Session reminders" onChange={set('sessionReminders')} />
            </Row>
            <Row
              title="Remind Me"
              htmlFor="set-reminder"
              description="How early to send the reminder."
              disabled={!settings.sessionReminders}
            >
              <Select
                id="set-reminder"
                value={settings.reminderLead}
                options={REMINDER_TIMES}
                disabled={!settings.sessionReminders}
                onChange={(value) => onChange('reminderLead', Number(value))}
              />
            </Row>
            <Row title="Someone Joins Your Session" description="Get a notification when a student joins a session you're hosting.">
              <Switch checked={settings.waitlistAlerts} label="Notify me when someone joins my session" onChange={set('waitlistAlerts')} />
            </Row>
            <Row title="Study Buddy Requests" description="Let other Anteaters know you'd like to hear about new buddy requests.">
              <Switch checked={settings.buddyRequests} label="Study buddy requests" onChange={set('buddyRequests')} />
            </Row>
            <Row title="Weekly Email Summary" description="A Sunday email with your upcoming sessions for the week.">
              <Switch checked={settings.emailSummaries} label="Weekly email summary" onChange={set('emailSummaries')} />
            </Row>
            <p className="settings-note">Reminders and emails will be sent once ZotStudy is connected to a server.</p>
          </section>

          <section className="panel-block settings-card" id="settings-study">
            <h2>Study Preferences</h2>
            <Row title="Default Session Length" htmlFor="set-length" description="Used to fill in the end time when you create a session.">
              <Select
                id="set-length"
                value={settings.defaultLength}
                options={SESSION_LENGTHS}
                onChange={(value) => onChange('defaultLength', Number(value))}
              />
            </Row>
            <Row title="Default Location" htmlFor="set-location" description="Pre-selected when you create a session.">
              <Select id="set-location" value={settings.defaultLocation} options={LOCATIONS} onChange={set('defaultLocation')} />
            </Row>
            <Row title="Default Study Style" htmlFor="set-style" description="Pre-selected when you create a session.">
              <Select id="set-style" value={settings.defaultStyle} options={STYLES} onChange={set('defaultStyle')} />
            </Row>
            <Row title="Hide Conflicting Sessions" description="Hide sessions that overlap with ones you're in from the All Sessions list.">
              <Switch checked={settings.hideConflicts} label="Hide conflicting sessions" onChange={set('hideConflicts')} />
            </Row>
          </section>

          <section className="panel-block settings-card" id="settings-privacy">
            <h2>Privacy</h2>
            <Row title="Profile Visibility" htmlFor="set-visibility" description="Who can see your profile, bio and contact info.">
              <Select id="set-visibility" value={settings.profileVisibility} options={VISIBILITY_OPTIONS} onChange={set('profileVisibility')} />
            </Row>
            <Row title="Show Me in Study Buddies" description="Let classmates find you on the Find Study Buddies page.">
              <Switch checked={settings.showInBuddies} label="Show me in study buddies" onChange={set('showInBuddies')} />
            </Row>
            <Row title="Show My Name in Session Lists" description="Other attendees can see your name in Who's Going.">
              <Switch checked={settings.showNameInLists} label="Show my name in session lists" onChange={set('showNameInLists')} />
            </Row>
          </section>

          <section className="panel-block settings-card" id="settings-account">
            <h2>Account</h2>
            <Row title="Name" description={currentUser}>
              <button type="button" className="ghost" onClick={() => onNavigate('profile')}>
                Edit Profile
              </button>
            </Row>
            <Row title="Email" description={profile.email || 'No email added yet'}>
              <button type="button" className="ghost" onClick={() => onNavigate('profile')}>
                {profile.email ? 'Change Email' : 'Add Email'}
              </button>
            </Row>
            <Row title="Download My Data" description="Save a copy of your profile, courses, sessions and settings.">
              <button type="button" className="ghost" onClick={onDownloadData}>
                Download
              </button>
            </Row>
            <Row title="Reset Settings" description="Put every setting on this page back to its default.">
              <button type="button" className="ghost" onClick={onResetSettings}>
                Reset
              </button>
            </Row>
            <div className="danger-zone">
              <Row title="Delete Account" description="Remove your profile, courses and sessions from ZotStudy. This can't be undone.">
                <button type="button" className="danger-btn" onClick={onDeleteAccount}>
                  Delete Account
                </button>
              </Row>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
