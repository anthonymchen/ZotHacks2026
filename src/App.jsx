import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './Login.jsx'
import Onboarding from './onboarding/Onboarding.jsx'
import MainApp from './MainApp.jsx'
import { getCurrentUser, clearCurrentUser, isOnboarded } from './currentUser'

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
  // Only signed-in students who finished onboarding can open the app.
  if (!signedIn) return <Navigate to="/" replace />
  if (!isOnboarded(signedIn)) return <Navigate to="/signup" replace />
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
