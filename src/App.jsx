import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './Login.jsx'
import Onboarding from './onboarding/Onboarding.jsx'
import MainApp from './MainApp.jsx'

// The main app sends Log Out back to the login page.
function MainAppRoute() {
  const navigate = useNavigate()
  return <MainApp onLogout={() => navigate('/')} />
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
