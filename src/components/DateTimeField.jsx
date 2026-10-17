import { useEffect, useRef, useState } from 'react'

// Values use the same "YYYY-MM-DDTHH:MM" format as a datetime-local input.
function split(value) {
  if (!value) return { date: '', time: '' }
  const [date, time = ''] = value.split('T')
  return { date, time: time.slice(0, 5) }
}

function pretty(value) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// A date + time picker that only sets the value when Confirm is pressed.
export default function DateTimeField({ id, label, value, onChange, suggest = '', validate, invalid = false }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(split(value))
  const [problem, setProblem] = useState('')
  const wrapRef = useRef(null)
  const dateRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    dateRef.current?.focus()
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    function handleClickAway(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClickAway)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClickAway)
    }
  }, [open])

  function openPicker() {
    setDraft(split(value || suggest))
    setProblem('')
    setOpen(true)
  }

  function confirm() {
    if (!draft.date || !draft.time) {
      setProblem('Pick both a date and a time.')
      return
    }
    const next = `${draft.date}T${draft.time}`
    const message = validate ? validate(next) : ''
    if (message) {
      setProblem(message)
      return
    }
    onChange(next)
    setOpen(false)
  }

  function confirmOnEnter(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      confirm()
    }
  }

  return (
    <div className="dt-field" ref={wrapRef}>
      <label htmlFor={id}>{label}</label>
      <button
        type="button"
        id={id}
        className={`dt-trigger${value ? ' has-value' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={() => (open ? setOpen(false) : openPicker())}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h2v2h6V3h2v2h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2zm12 6H5v10h14z" />
        </svg>
        <span>{pretty(value) || 'Select Date & Time'}</span>
      </button>

      {open ? (
        <div className="dt-pop" role="dialog" aria-label={`Choose ${label.toLowerCase()} date and time`}>
          <div className="dt-inputs">
            <label>
              Date
              <input
                ref={dateRef}
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
                onKeyDown={confirmOnEnter}
              />
            </label>
            <label>
              Time
              <input
                type="time"
                step={300}
                value={draft.time}
                onChange={(event) => setDraft((prev) => ({ ...prev, time: event.target.value }))}
                onKeyDown={confirmOnEnter}
              />
            </label>
          </div>
          {problem ? <p className="error">{problem}</p> : null}
          <div className="dt-actions">
            <button type="button" className="ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="primary" onClick={confirm}>
              Confirm
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
