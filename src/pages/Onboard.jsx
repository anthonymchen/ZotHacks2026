import { useState } from 'react'

export default function Onboard({ onContinue }) {
  const [name, setName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onContinue(trimmed)
  }

  return (
    <main className="page onboard">
      <p className="eyebrow">ZotStudy</p>
      <h1>Find your study group</h1>
      <p className="lede">Tell us your name so you can join or host a session.</p>
      <form className="panel" onSubmit={handleSubmit}>
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Joshua"
          autoComplete="name"
        />
        <button type="submit" disabled={!name.trim()}>
          Continue
        </button>
      </form>
    </main>
  )
}
