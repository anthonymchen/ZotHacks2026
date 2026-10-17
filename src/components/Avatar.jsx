import { initials } from '../time'

export default function Avatar({ name, photo, size = 'medium' }) {
  return (
    <span className={`avatar avatar-${size}`} aria-hidden="true">
      {photo ? <img src={photo} alt="" /> : initials(name || '?')}
    </span>
  )
}
