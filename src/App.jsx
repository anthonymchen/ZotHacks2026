
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login.jsx'
import Onboarding from './onboarding/Onboarding.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App