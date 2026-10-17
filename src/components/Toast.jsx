import { useEffect } from 'react'

// A small notification in the corner that hides itself after a few seconds.
export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(onDone, 5000)
    return () => clearTimeout(timer)
  }, [toast, onDone])

  if (!toast) return null
  return (
    <div className="app-toast" role="status" aria-live="polite" key={toast.id}>
      <span className="app-toast-icon" aria-hidden="true">
        ★
      </span>
      <span>{toast.message}</span>
      <button type="button" className="app-toast-close" aria-label="Dismiss" onClick={onDone}>
        ×
      </button>
    </div>
  )
}
