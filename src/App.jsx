import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './Login.jsx'
import Onboarding from './onboarding/Onboarding.jsx'
import MainApp from './MainApp.jsx'
import { getCurrentUser, clearCurrentUser, isOnboarded } from './currentUser'
import { loadAccount, legacyOnboarding, profileFromOnboarding } from './accountData'

// The saved data for whoever signed in. Older browsers only have the single
// onboarding record, so use that if it belongs to this person.
function accountFor(signedIn) {
  const saved = loadAccount(signedIn.id) || (signedIn.email ? loadAccount(signedIn.email.toLowerCase()) : null)
  if (saved) return saved
  const legacy = legacyOnboarding()
  if (!legacy) return null
  const sameEmail = signedIn.email && legacy.email?.toLowerCase() === signedIn.email.toLowerCase()
  if (sameEmail || !signedIn.email) {
    return { ...legacy, profile: profileFromOnboarding(legacy) }
  }
  return null
}

// The main app greets whoever signed in (login page or onboarding) and
// loads the classes from onboarding. Log Out goes back to the login page.
function MainAppRoute() {
  const navigate = useNavigate()
  const signedIn = getCurrentUser()
  // Only signed-in students who finished onboarding can open the app.
  if (!signedIn) return <Navigate to="/" replace />
  if (!isOnboarded(signedIn)) return <Navigate to="/signup" replace />
  const account = accountFor(signedIn)
  const props = { accountId: signedIn.id, account }
  // Prefer the name they chose (onboarding or Edit Profile) over a login username.
  const name = account?.name?.trim() || signedIn?.name?.trim()
  if (name) props.user = name
  if (Array.isArray(account?.courses)) {
    props.courses = account.courses.map((course) => (typeof course === 'string' ? course : course.code)).filter(Boolean)
  }
  return (
    <MainApp
      key={signedIn.id}
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
