import { useEffect, useRef } from 'react'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  illustration = null,
  confirmTone = 'danger',
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    cancelRef.current?.focus()
    function handleKey(event) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="dialog-backdrop" onMouseDown={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {illustration ? <div className="dialog-art">{illustration}</div> : null}
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button type="button" className="ghost" ref={cancelRef} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmTone === 'danger' ? 'danger-btn' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
