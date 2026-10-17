import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Onboarding.css'
import { saveProfile } from '../lib/users'
import { setCurrentUser, getCurrentUser, markOnboarded } from '../currentUser'
import CourseSearch from '../components/CourseSearch'
import { findCourse, getCourseInstructors } from '../lib/uciCourses'
import { loadAccount, saveAccount, profileFromOnboarding } from '../accountData'


const MAJORS = [
  'Computer Science',
  'Software Engineering',
  'Informatics',
  'Data Science',
  'Computer Game Science',
  'Computer Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Biomedical Engineering',
  'Mathematics',
  'Applied Physics',
  'Biological Sciences',
  'Business Administration',
  'Psychology',
  'Undeclared',
  'Other',
]

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5th+', 'Graduate']

const STORAGE_KEY = 'zotstudy-onboarding'

const STYLES = [
  { value: 'quiet', label: 'Quiet', hint: 'Heads down, minimal talking' },
  { value: 'collaborative', label: 'Collaborative', hint: 'Work through problems together' },
  { value: 'teaching', label: 'Teaching', hint: 'Explain and quiz each other' },
  { value: 'practice', label: 'Practice', hint: 'Problem sets and past exams' },
]

function resolveInstructor(typed, names) {
  const t = typed.trim().toLowerCase()
  const exact = names.find((n) => n.toLowerCase() === t)
  if (exact) return exact
  const byLast = names.filter(
    (n) => n.trim().split(/\s+/).slice(-1)[0].toLowerCase() === t,
  )
  return byLast.length === 1 ? byLast[0] : null
}

export default function Onboarding() {
  const navigate = useNavigate()
  // If they signed in with Google, start with their name and email filled in.
  const [form, setForm] = useState(() => {
    const signedIn = getCurrentUser()
    return {
      name: signedIn?.fullName || '',
      email: signedIn?.email || '',
      major: '',
      year: '',
      courses: [],
      styles: [],
    }
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState(1)
  const [courseInput, setCourseInput] = useState({ code: '', professor: '' })
  const [courseError, setCourseError] = useState('')
  const [checkingCourse, setCheckingCourse] = useState(false)
   const [instructors, setInstructors] = useState([])
  const [styleError, setStyleError] = useState('')


  useEffect(() => {
    setInstructors([])
    const typed = courseInput.code.trim()
    if (!typed) return undefined
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const match = await findCourse(typed)
        if (!match || cancelled) return
        const names = await getCourseInstructors(match.code)
        if (!cancelled) setInstructors(names)
      } catch {
        // Professors couldn't load: the box stays disabled, the course can still be added.
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [courseInput.code])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
    setSaved(false)
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email'
    }
    else if (!/@([a-z0-9-]+\.)*uci\.edu$/i.test(form.email.trim())) {  
      next.email = 'Use your @uci.edu email'                              
    }
    if (!form.major) next.major = 'Pick your major'
    if (!form.year) next.year = 'Pick your year'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setSaved(false)
      return
    }

    const profile = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      step: 'student-info',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    console.log('Onboarding student info', profile)
    setStep(2)
  }

  // Only real UCI courses can be added: checked against Anteater API.
  async function addCourse() {
    const typed = courseInput.code.trim().toUpperCase().replace(/\s+/g, ' ')
    if (!typed) {
      setCourseError('Enter a course code, like MATH 2A')
      return
    }
    let match = null
    setCheckingCourse(true)
    try {
      match = await findCourse(typed)
    } catch {
      setCourseError("Couldn't reach UCI's course list. Check your connection and try again.")
      return
    } finally {
      setCheckingCourse(false)
    }
    if (!match) {
      setCourseError(`${typed} isn't a UCI course. Pick one from the list, like MATH 2A or I&C SCI 31.`)
      return
    }

    let professor = courseInput.professor.trim()
    if (professor && instructors.length) {
    const resolved = resolveInstructor(professor, instructors)
    if (!resolved) {
      setCourseError(`${professor} isn't listed for ${match.code}. Pick from the list or leave it blank.`)
      return
    }
    professor = resolved
    }

    const code = match.code
    if (form.courses.some((c) => c.code === code)) {
      setCourseError('You already added that class')
      return
    }
    setForm((prev) => ({
      ...prev,
      courses: [...prev.courses, { code, title: match.title, professor }],
    }))
    setCourseInput({ code: '', professor: '' })
    setCourseError('')
    setSaved(false)
  }

  function removeCourse(code) {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.code !== code),
    }))
    setSaved(false)
  }

  async function handleClassesSubmit(event) {
    event.preventDefault()
    if (!form.courses.length) {
      setCourseError('Add at least one class')
      return
    }

    const profile = { ...form, step: 'classes' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    console.log('Onboarding classes', profile)

    try {
      await saveProfile({
        name: profile.name,
        email: profile.email,
        major: profile.major,
        year: profile.year,
        courses: profile.courses,
      })
    } catch (err) {
      console.error('Could not save classes to Firebase', err)
    }

    setStep(3)
  }

    function toggleStyle(value) {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(value)
        ? prev.styles.filter((s) => s !== value)
        : [...prev.styles, value],
    }))
    setStyleError('')
    setSaved(false)
  }

  async function handleStyleSubmit(event) {
    event.preventDefault()
    if (!form.styles.length) {
      setStyleError('Pick at least one study style')
      return
    }

    const profile = { ...form, step: 'study-style', onboarded: true }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    console.log('Onboarding complete', profile)

    try {
      // The whole account goes into the "users" collection.
      const signedIn = getCurrentUser()
      await saveProfile({
        name: profile.name,
        email: profile.email,
        major: profile.major,
        year: profile.year,
        courses: profile.courses,
        styles: profile.styles,
        onboarded: true,
        accountId: signedIn?.id || profile.email.trim().toLowerCase(),
        loginMethod: signedIn?.email ? 'google' : signedIn?.name ? 'username' : 'signup',
        username: signedIn && !signedIn.email ? signedIn.name : '',
        onboardedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Could not save study style to Firebase', err)
    }

    setSaved(true)
    // Mark this account as onboarded so it can open the main app, both for
    // the login it came from and for the email entered here.
    const signedIn = getCurrentUser()
    const email = profile.email.trim()
    markOnboarded(signedIn, email.toLowerCase())
    const accountId = signedIn?.id || email.toLowerCase()
    setCurrentUser({ name: profile.name.trim(), email, id: accountId })
    // Remember everything for this account (and for the email, so a later
    // Google sign-in with it finds the same data).
    const record = {
      name: profile.name.trim(),
      email,
      major: profile.major,
      year: profile.year,
      courses: profile.courses,
      styles: profile.styles,
    }
    ;[accountId, email.toLowerCase()].forEach((id) => {
      const existing = loadAccount(id)
      saveAccount(id, {
        ...record,
        profile: { ...(existing?.profile || {}), ...profileFromOnboarding(record) },
      })
    })
    // Show "You're all set!" for a moment, then open the main app.
    setTimeout(() => navigate('/home'), 900)
  }

  return (
    <main className="onboarding">
      <aside className="onboarding-brand">
        <p className="onboarding-kicker">ZotStudy</p>
        <h1>Let’s get you set up.</h1>
        <p className="onboarding-lead">
          Tell us who you are so we can match you with Anteaters studying the
          same courses.
        </p>
        <ol className="onboarding-steps" aria-label="Onboarding progress">
          <li className={step === 1 ? 'is-active' : ''}>Student info</li>
          <li className={step === 2 ? 'is-active' : ''}>Your classes</li>
          <li className={step === 3 ? 'is-active' : ''}>Study style</li>
        </ol>
      </aside>

      <section className="onboarding-panel">
        <p className="onboarding-step-label">Step {step} of 3</p>
        {step === 1 && (
          <>
          <h2>Student info</h2>
          <p className="onboarding-sub">
            This becomes your name on study sessions you host or join.
          </p>

          <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
            <label>
              <span>Preferred name <span className="required" aria-hidden="true">*</span></span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="First Last"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </label>

            <label>
              <span>Email<span className="required" aria-hidden="true">*</span></span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="UCInetID@uci.edu"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={() => {                                              
                  const next = validate()                                    
                  setErrors((prev) => ({ ...prev, email: next.email || '' })) 
                }} 
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>

            <div className="onboarding-row">
              <label>
                <span>Major<span className="required" aria-hidden="true">*</span></span>
                <select
                  name="major"
                  value={form.major}
                  onChange={(e) => update('major', e.target.value)}
                >
                  <option value="">Select major</option>
                  {MAJORS.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
                {errors.major && <span className="field-error">{errors.major}</span>}
              </label>

              <label>
                <span>Year<span className="required" aria-hidden="true">*</span></span>
                <select
                  name="year"
                  value={form.year}
                  onChange={(e) => update('year', e.target.value)}
                >
                  <option value="">Select year</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.year && <span className="field-error">{errors.year}</span>}
              </label>
            </div>

            <button type="submit" className="onboarding-next">
              Continue
            </button>

                    </form>
        </>
        )}

        {step === 2 && (
          <>
            <h2>Your classes</h2>
            <p className="onboarding-sub">
              Add the courses you want study partners for.
            </p>

            <form className="onboarding-form" onSubmit={handleClassesSubmit} noValidate>
              <div className="onboarding-row">
                <label>
                  <span>Course <span className="required" aria-hidden="true">*</span></span>
                  <CourseSearch
                    ariaLabel="Course"
                    placeholder="Search UCI courses, e.g. MATH 2A"
                    value={courseInput.code}
                    existing={form.courses.map((c) => c.code)}
                    onChange={(text) => {
                      setCourseInput({ code: text, professor: '' })
                      setCourseError('')
                    }}
                    onPick={(course) => {
                      setCourseInput({ code: course.code, professor: '' })
                      setCourseError('')
                    }}
                    onEnter={addCourse}
                  />
                </label>

                <label>
                  Professor (optional)
                  <input
                    type="text"
                    list="professor-options"
                    placeholder={instructors.length ? 'Search professors' : 'Select a course first'}
                    disabled={!instructors.length}
                    value={courseInput.professor}
                    onChange={(e) =>
                      setCourseInput((prev) => ({ ...prev, professor: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCourse()
                      }
                    }}
                  />
                  <datalist id="professor-options">
                    {instructors.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </label>
              </div>

              {courseError && <span className="field-error">{courseError}</span>}

              <button type="button" className="onboarding-add" onClick={addCourse} disabled={checkingCourse}>
                {checkingCourse ? 'Checking…' : 'Add class'}
              </button>

              {form.courses.length > 0 && (
                <ul className="course-list">
                  {form.courses.map((c) => (
                    <li key={c.code}>
                      <span>
                        <strong>{c.code}</strong>
                        {c.title && ` · ${c.title}`}
                        {c.professor && ` · Prof. ${c.professor}`}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${c.code}`}
                        onClick={() => removeCourse(c.code)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="onboarding-actions">
                <button type="button" className="onboarding-back" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="onboarding-next">
                  Continue
                </button>
              </div>

              {saved && (
                <p className="onboarding-saved" role="status">
                  Classes saved. Study style comes next.
                </p>
              )}
            </form>
          </>
        )}
        {step === 3 && (
          <>
            <h2>How you like to study</h2>
            <p className="onboarding-sub">
              Pick one or more. We&apos;ll use these as your defaults.
            </p>

            <form className="onboarding-form" onSubmit={handleStyleSubmit} noValidate>
              <div className="style-options" role="group" aria-label="Study styles">
                {STYLES.map((s) => {
                  const selected = form.styles.includes(s.value)
                  return (
                    <button
                      key={s.value}
                      type="button"
                      className={`style-chip${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => toggleStyle(s.value)}
                    >
                      <strong>{s.label}</strong>
                      <span>{s.hint}</span>
                    </button>
                  )
                })}
              </div>

              {styleError && <span className="field-error">{styleError}</span>}

              <div className="onboarding-actions">
                <button type="button" className="onboarding-back" onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="submit" className="onboarding-next">
                  Finish
                </button>
              </div>

              {saved && (
                <p className="onboarding-saved" role="status">
                  You&apos;re all set!
                </p>
              )}
            </form>
          </>
        )}
      </section>
    </main>
  )}
