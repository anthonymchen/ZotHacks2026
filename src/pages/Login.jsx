import { AnteaterPeek } from '../components/Illustrations'
import { useState } from 'react'

export default function Login({ onLogin }) {
  const [name, setName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onLogin(trimmed)
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <AnteaterPeek className="auth-peek" />
        <p className="brand">ZotStudy</p>
        <h1>Welcome back</h1>
        <p className="lede">Log in to find study buddies and join study sessions with other Anteaters.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Alex"
            autoComplete="name"
          />
          <button type="submit" disabled={!name.trim()}>
            Log in
          </button>
        </form>
      </div>
    </main>
  )
}
