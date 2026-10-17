import { useState } from 'react'
import './Onboarding.css'
import { saveProfile } from '../lib/users'


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

export default function Onboarding() {
  const [form, setForm] = useState({ name: '', email: '', major: '', year: '', courses: [] })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState(1)
  const [courseInput, setCourseInput] = useState({ code: '', professor: '' })
  const [courseError, setCourseError] = useState('')

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

  function addCourse() {
    const code = courseInput.code.trim().toUpperCase().replace(/\s+/g, ' ')
    if (!code) {
      setCourseError('Enter a course code, like MATH 2A')
      return
    }
    if (!/^[A-Z&]+( [A-Z&]+)* ?\d+[A-Z]*$/.test(code)) {
      setCourseError('Use a format like MATH 2A or COMPSCI 161')
      return
    }
    if (form.courses.some((c) => c.code === code)) {
      setCourseError('You already added that class')
      return
    }
    setForm((prev) => ({
      ...prev,
      courses: [...prev.courses, { code, professor: courseInput.professor.trim() }],
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

    setSaved(true)
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
          <li>Study style</li>
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
                  <input
                    type="text"
                    placeholder="MATH 2A"
                    value={courseInput.code}
                    onChange={(e) => {
                      setCourseInput((prev) => ({ ...prev, code: e.target.value }))
                      setCourseError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCourse()
                      }
                    }}
                  />
                </label>

                <label>
                  Professor (optional)
                  <input
                    type="text"
                    placeholder="Last name"
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
                </label>
              </div>

              {courseError && <span className="field-error">{courseError}</span>}

              <button type="button" className="onboarding-add" onClick={addCourse}>
                Add class
              </button>

              {form.courses.length > 0 && (
                <ul className="course-list">
                  {form.courses.map((c) => (
                    <li key={c.code}>
                      <span>
                        <strong>{c.code}</strong>
                        {c.professor && ` · ${c.professor}`}
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
      </section>
    </main>
  )}
