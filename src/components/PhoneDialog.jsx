import { useEffect, useRef, useState } from 'react'
import { phoneProblem, formatPhone } from '../sessions.js'

// Asks for a phone number before joining a session, so the group can
// reach each other. Pre-filled with the last number used.
export default function PhoneDialog({ open, course, initialPhone = '', onConfirm, onCancel }) {
  const [phone, setPhone] = useState(initialPhone)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    setPhone(initialPhone)
    setError('')
    inputRef.current?.focus()
    function handleKey(event) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, initialPhone, onCancel])

  if (!open) return null

  function submit(event) {
    event.preventDefault()
    const problem = phoneProblem(phone)
    if (problem) {
      setError(problem)
      return
    }
    onConfirm(formatPhone(phone))
  }

  return (
    <div className="dialog-backdrop" onMouseDown={onCancel}>
      <form
        className="dialog phone-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={submit}
        noValidate
      >
        <h2 id="phone-dialog-title">Join {course} Study Session</h2>
        <p>Add your phone number so the host and the group can reach you. Only people in this session can see it.</p>
        <label htmlFor="join-phone" className="dialog-label">
          Phone Number
        </label>
        <input
          ref={inputRef}
          id="join-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(949) 555-0123"
          value={phone}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setPhone(event.target.value)
            setError('')
          }}
        />
        {error ? <p className="error">{error}</p> : null}
        <div className="dialog-actions">
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Join Session
          </button>
        </div>
      </form>
    </div>
  )
}
