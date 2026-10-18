import './Login.css'
import anteater from './anteater-studying.png'
import { FcGoogle } from 'react-icons/fc'
import { useGoogleLogin, useGoogleOAuth } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { setCurrentUser, getCurrentUser, homeFor } from './currentUser'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [googleError, setGoogleError] = useState('')
  const [googleBusy, setGoogleBusy] = useState(false)
  // Google's sign-in script loads in the background; clicking before it's
  // ready used to do nothing at all.
  const { scriptLoadedSuccessfully: googleReady } = useGoogleOAuth()

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
    // New accounts finish the 3 onboarding steps before entering the app.
    navigate(homeFor(getCurrentUser()))
  }
  const googleLogin = useGoogleLogin({
    // Only offer UCI accounts, and always show the account picker so a
    // personal Gmail that's already signed in isn't chosen automatically.
    hosted_domain: 'uci.edu',
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      setGoogleBusy(true)
      setGoogleError('')
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
          setGoogleError(`${user.email} isn't a UCI account. Choose your @uci.edu email.`)
          return
        }

        console.log('Logged in as', user.name, user.email)
        setCurrentUser({ name: user.given_name || user.name, fullName: user.name, email: user.email })
        navigate(homeFor(getCurrentUser()))
      } catch (error) {
        console.error(error)
        setGoogleError("Couldn't load your Google profile. Check your connection and try again.")
      } finally {
        setGoogleBusy(false)
      }
    },
    // Google turned the sign-in down (for example, access denied).
    onError: (error) => {
      console.error('Google sign-in error', error)
      setGoogleError(error?.error_description || 'Google sign-in failed. Please try again.')
    },
    // The pop-up was blocked or closed before finishing. These used to fail
    // silently, which is why sign-in sometimes seemed to do nothing.
    onNonOAuthError: (error) => {
      console.warn('Google sign-in window problem', error)
      if (error?.type === 'popup_failed_to_open') {
        setGoogleError('Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.')
      } else if (error?.type === 'popup_closed') {
        setGoogleError('The Google sign-in window was closed before you finished. Try again.')
      } else {
        setGoogleError('Google sign-in didn\'t finish. Please try again.')
      }
    },
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
            disabled={!googleReady || googleBusy}
            aria-label={googleReady ? 'Sign in with your UCI Google account' : 'Google sign-in is loading'}
            title={googleReady ? 'Sign in with your UCI Google account' : 'Google sign-in is loading…'}
            onClick={() => {
              setGoogleError('')
              googleLogin()
            }}
          >
            <FcGoogle />
          </button>
        </div>
        {googleError ? (
          <p className="login-error" role="alert">
            {googleError}
          </p>
        ) : null}

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