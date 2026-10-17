import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './Login.jsx'
import Onboarding from './onboarding/Onboarding.jsx'
import MainApp from './MainApp.jsx'

// Name and classes saved by onboarding (Onboarding.jsx stores them here).
function onboardingProfile() {
  try {
    return JSON.parse(localStorage.getItem('zotstudy-onboarding') || 'null')
  } catch {
    return null
  }
}

// The main app greets the student by the name and classes they entered
// during onboarding, and Log Out goes back to the login page.
function MainAppRoute() {
  const navigate = useNavigate()
  const saved = onboardingProfile()
  const props = {}
  if (saved?.name?.trim()) props.user = saved.name.trim()
  const courses = (saved?.courses || []).map((course) => course.code).filter(Boolean)
  if (courses.length) props.courses = courses
  return <MainApp {...props} onLogout={() => navigate('/')} />
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
