import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './Login.jsx'
import Onboarding from './onboarding/Onboarding.jsx'
import MainApp from './MainApp.jsx'
import { getCurrentUser, clearCurrentUser } from './currentUser'

// Name and classes saved by onboarding (Onboarding.jsx stores them here).
function onboardingProfile() {
  try {
    return JSON.parse(localStorage.getItem('zotstudy-onboarding') || 'null')
  } catch {
    return null
  }
}

// The main app greets whoever signed in (login page or onboarding) and
// loads the classes from onboarding. Log Out goes back to the login page.
function MainAppRoute() {
  const navigate = useNavigate()
  const signedIn = getCurrentUser()
  const saved = onboardingProfile()
  const props = {}
  const name = signedIn?.name?.trim() || saved?.name?.trim()
  if (name) props.user = name
  const courses = (saved?.courses || []).map((course) => course.code).filter(Boolean)
  if (courses.length) props.courses = courses
  return (
    <MainApp
      {...props}
      onLogout={() => {
        clearCurrentUser()
        navigate('/')
      }}
    />
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Onboarding />} />
        <Route path="/home" element={<MainAppRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
