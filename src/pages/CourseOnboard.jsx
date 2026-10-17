import { AnteaterPeek } from '../components/Illustrations'
import { useState } from 'react'
import { SUGGESTED_COURSES } from '../data'

export default function CourseOnboard({ userName, onContinue }) {
  const [courses, setCourses] = useState(['ICS 31', 'Math 2B', 'Writing 39C'])
  const [draft, setDraft] = useState('')

  function addCourse(course) {
    const next = course.trim()
    if (!next) return
    setCourses((prev) => (prev.includes(next) ? prev : [...prev, next]))
    setDraft('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (draft.trim()) {
      addCourse(draft)
      return
    }
    if (courses.length === 0) return
    onContinue(courses)
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <AnteaterPeek className="auth-peek" />
        <p className="brand">ZotStudy</p>
        <h1>What are you taking, {userName}?</h1>
        <p className="lede">Add your courses so we can match you with the right sessions and study buddies.</p>
        <form onSubmit={handleSubmit}>
          <div className="course-editor">
            {courses.map((course) => (
              <button
                key={course}
                type="button"
                className="course-chip"
                onClick={() => setCourses((prev) => prev.filter((item) => item !== course))}
              >
                {course} ×
              </button>
            ))}
          </div>
          <label htmlFor="course">Add a course</label>
          <div className="add-row">
            <input
              id="course"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="e.g. ICS 46"
              list="course-suggestions"
            />
            <button type="button" className="ghost" onClick={() => addCourse(draft)}>
              Add
            </button>
          </div>
          <datalist id="course-suggestions">
            {SUGGESTED_COURSES.map((course) => (
              <option key={course} value={course} />
            ))}
          </datalist>
          <button type="submit" disabled={courses.length === 0 && !draft.trim()}>
            Continue to home
          </button>
        </form>
      </div>
    </main>
  )
}
