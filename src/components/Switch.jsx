// An on/off toggle switch. Optional icons show inside the knob track.
export default function Switch({ checked, onChange, label, onIcon = null, offIcon = null, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`switch${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      {onIcon || offIcon ? (
        <>
          <span className="switch-icon left" aria-hidden="true">
            {onIcon}
          </span>
          <span className="switch-icon right" aria-hidden="true">
            {offIcon}
          </span>
        </>
      ) : null}
      <span className="switch-knob" aria-hidden="true" />
    </button>
  )
}
