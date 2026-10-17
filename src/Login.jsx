import './Login.css'
import anteater from './anteater-studying.png'
import { FcGoogle } from 'react-icons/fc'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { setCurrentUser } from './currentUser'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // There's no account database yet, so a "valid" login means both
  // fields are filled in. Swap this for a real check (e.g. Firebase
  // email/password sign-in) once accounts exist.
  function handleLogin(event) {
    event.preventDefault()
    const name = username.trim()
    if (name.length < 3) {
      setLoginError('Enter your username (at least 3 characters).')
      return
    }
    if (password.length < 6) {
      setLoginError('Enter your password (at least 6 characters).')
      return
    }
    setLoginError('')
    setCurrentUser({ name })
    navigate('/home')
  }
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        )

        if (!res.ok) {
          throw new Error('Failed to fetch user info')
        }

        const user = await res.json()

        if (!user.email?.toLowerCase().endsWith('@uci.edu')) {
          alert('Please use your UCI email.')
          return
        }

        console.log('Logged in as', user.name, user.email)
        setCurrentUser({ name: user.given_name || user.name, email: user.email })
        navigate('/home')
      } catch (error) {
        console.error(error)
        alert('Google login failed')
      }
    },
    onError: () => alert('Google login failed'),
  })

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Login</h2>

        <form onSubmit={handleLogin} noValidate>
          <label htmlFor="login-username">Username:</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value)
              setLoginError('')
            }}
          />

          <label htmlFor="login-password">Password:</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setLoginError('')
            }}
          />

          {loginError ? (
            <p className="login-error" role="alert">
              {loginError}
            </p>
          ) : null}

          <label>
            <input type="checkbox" />
            Remember me
          </label>

          <button type="submit">Log in</button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="social">
          <button
            type="button"
            className="social-button"
            onClick={() => googleLogin()}
          >
            <FcGoogle />
          </button>
        </div>

        <button type="button" className="signup-button" onClick={() => navigate('/signup')}>
        Sign Up
        </button>
      </div>

      <div className="login-welcome">
        <h1>
          Welcome to
          <span>ZotStudy</span>
        </h1>
        <p>Connect and study with other Anteaters!</p>
        <img src={anteater} alt="Anteater studying" />
      </div>
    </div>
  )
}

export default Login