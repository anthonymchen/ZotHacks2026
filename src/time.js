export function formatSessionWhen(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Pick a start and end time'
  }
  const today = new Date()
  const sameDay =
    startDate.getFullYear() === today.getFullYear() &&
    startDate.getMonth() === today.getMonth() &&
    startDate.getDate() === today.getDate()

  const day = sameDay
    ? 'Today'
    : startDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
  const timeOpts = { hour: 'numeric', minute: '2-digit' }
  return `${day}, ${startDate.toLocaleTimeString([], timeOpts)} – ${endDate.toLocaleTimeString([], timeOpts)}`
}

export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
