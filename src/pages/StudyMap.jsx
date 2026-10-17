import { LOCATIONS } from '../data'

export default function StudyMap({ sessions }) {
  const counts = LOCATIONS.map((location) => ({
    location,
    count: sessions.filter((session) => session.location === location).length,
    people: sessions
      .filter((session) => session.location === location)
      .reduce((sum, session) => sum + session.attendees.length, 0),
  }))

  return (
    <main className="dashboard">
      <header className="page-head">
        <div>
          <h1>Study Map</h1>
          <p>See where people are studying live around campus.</p>
        </div>
      </header>
      <div className="map-grid">
        {counts.map((spot) => (
          <article key={spot.location} className="map-card">
            <h3>{spot.location}</h3>
            <p>
              {spot.count} open session{spot.count === 1 ? '' : 's'}
            </p>
            <p>
              {spot.people} {spot.people === 1 ? 'person' : 'people'} studying
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}
