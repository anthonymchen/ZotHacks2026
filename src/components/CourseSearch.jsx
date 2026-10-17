import { useEffect, useId, useRef, useState } from 'react'
import { suggestCourses, findCourse, canonicalCourse, getDepartments } from '../lib/uciCourses'
import './CourseSearch.css'

// A course box that suggests real UCI courses as you type (from Anteater API)
// and only accepts courses that exist.
//
// Two ways to use it:
// - Simple: pass onSelect(course). Picking a suggestion or pressing Enter on a
//   valid course calls it with { code, title }.
// - Controlled: pass value + onChange, plus onPick(course) to fill the box and
//   onEnter() for your own submit (onboarding uses this).
export default function CourseSearch({
  id,
  value,
  onChange,
  onPick,
  onEnter,
  onSelect,
  onCancel,
  existing = [],
  placeholder = 'Search UCI courses, e.g. MATH 2B',
  autoFocus = false,
  ariaLabel = 'Course',
}) {
  const controlled = value !== undefined
  const [ownText, setOwnText] = useState('')
  const text = controlled ? value : ownText
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [status, setStatus] = useState('') // '' | 'loading' | 'none' | 'offline'
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const latest = useRef(0)
  const listId = useId()
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // Look up suggestions shortly after typing stops.
  useEffect(() => {
    const query = text.trim()
    if (!query) {
      setItems([])
      setStatus('')
      return undefined
    }
    const ticket = ++latest.current
    setStatus('loading')
    const timer = setTimeout(() => {
      suggestCourses(query)
        .then((list) => {
          if (ticket !== latest.current) return
          setItems(list)
          // Only pre-select an exact match, so Enter never picks a course you didn't type.
          const typed = canonicalCourse(query)
          setActive(list.findIndex((item) => canonicalCourse(item.code) === typed))
          setStatus(list.length ? '' : 'none')
        })
        .catch(() => {
          if (ticket !== latest.current) return
          setItems([])
          setStatus('offline')
        })
    }, 200)
    return () => clearTimeout(timer)
  }, [text])

  function setText(next) {
    if (controlled) onChange?.(next)
    else setOwnText(next)
    setError('')
    setOpen(true)
  }

  const already = (code) => existing.some((item) => canonicalCourse(item) === canonicalCourse(code))

  function choose(item) {
    if (item.type === 'dept') {
      // Picked a department: keep typing the number.
      setText(`${item.code} `)
      inputRef.current?.focus()
      return
    }
    if (already(item.code)) {
      setError(`You already added ${item.code}.`)
      return
    }
    setOpen(false)
    if (onPick) {
      onPick(item)
      return
    }
    onSelect?.(item)
    setOwnText('')
  }

  // Enter without a highlighted suggestion: check the typed course with UCI.
  async function submitTyped() {
    if (onEnter) {
      onEnter()
      return
    }
    const typed = text.trim()
    if (!typed) return
    setChecking(true)
    try {
      const course = await findCourse(typed)
      if (course) choose(course)
      else setError(`"${typed}" isn't a UCI course. Pick one from the list, like I&C SCI 31 or MATH 2B.`)
    } catch {
      setError("Couldn't reach UCI's course list. Check your connection and try again.")
    } finally {
      setChecking(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' && items.length) {
      event.preventDefault()
      setOpen(true)
      setActive((index) => (index + 1) % items.length)
    } else if (event.key === 'ArrowUp' && items.length) {
      event.preventDefault()
      setActive((index) => (index - 1 + items.length) % items.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (open && active >= 0 && items[active]) choose(items[active])
      else submitTyped()
    } else if (event.key === 'Escape') {
      if (open && (items.length || status)) {
        event.stopPropagation()
        setOpen(false)
      } else {
        onCancel?.()
      }
    }
  }

  const empty = !text.trim()
  const showList = open && (empty || items.length > 0 || status)

  return (
    <div className="course-search">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={Boolean(showList)}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete="off"
        spellCheck="false"
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setOpen(true)
          getDepartments().catch(() => {}) // warm up so the first suggestions are quick
        }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {showList ? (
        <ul className="course-suggest" role="listbox" id={listId}>
          {items.map((item, index) => (
            <li
              key={`${item.type}-${item.code}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={`course-option${index === active ? ' active' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(item)}
            >
              <strong>{item.code}</strong>
              <span>{item.title}</span>
              {item.type === 'dept' ? <em>Department</em> : already(item.code) ? <em>Added</em> : null}
            </li>
          ))}
          {empty ? (
            <li className="course-status">
              Start typing a UCI course or department, like <strong>MATH 2A</strong>, <strong>I&amp;C SCI 31</strong> or{' '}
              <strong>CS 161</strong>.
            </li>
          ) : null}
          {!empty && status === 'loading' && items.length === 0 ? (
            <li className="course-status">Searching UCI courses…</li>
          ) : null}
          {status === 'none' ? <li className="course-status">No UCI courses match "{text.trim()}".</li> : null}
          {status === 'offline' ? (
            <li className="course-status">Couldn't reach UCI's course list right now.</li>
          ) : null}
        </ul>
      ) : null}
      {checking ? <p className="course-search-note">Checking with UCI…</p> : null}
      {error ? (
        <p className="course-search-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
