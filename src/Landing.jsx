import { useNavigate } from 'react-router-dom'
import anteater from './anteater-studying.png'
import './Landing.css'

const POINTS = ['Find study buddies in your classes', 'Connect with fellow Anteaters', 'Study smarter, together']

// The first page visitors see. Log In and Get Started open the login page;
// Sign Up goes straight to onboarding.
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <header className="landing-top">
        <span className="landing-logo">
          Zot<span>Study</span>
        </span>
        <nav className="landing-actions">
          <button type="button" className="landing-btn landing-btn-light" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button type="button" className="landing-btn landing-btn-gold" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </nav>
      </header>

      <main className="landing-hero">
        <section className="landing-copy">
          <span className="landing-pill">Made for UCI Anteaters</span>
          <h1>
            Study with Your <span className="gold">Fellow Anteaters</span> at UCI.
          </h1>
          <p className="landing-sub">Meet students in your courses, find study buddies, and make studying better together.</p>
          <ul className="landing-points">
            {POINTS.map((point) => (
              <li key={point}>
                <span aria-hidden="true">✓</span> {point}
              </li>
            ))}
          </ul>
          <button type="button" className="landing-btn landing-btn-gold landing-cta" onClick={() => navigate('/login')}>
            Get Started <span aria-hidden="true">→</span>
          </button>
        </section>

        <div className="landing-art">
          <img src={anteater} alt="An anteater in glasses carrying a notebook" />
        </div>
      </main>
    </div>
  )
}
