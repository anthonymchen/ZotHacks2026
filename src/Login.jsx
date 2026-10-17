import './Login.css'
import anteater from './anteater-studying.png'
import { FcGoogle } from 'react-icons/fc'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
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

        <form>
          <label>Username:</label>
          <input type="text" />

          <label>Password:</label>
          <input type="password" />

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