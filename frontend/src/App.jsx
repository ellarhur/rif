import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import RifDashboard from './components/RifDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<RifDashboard />} />
    </Routes>
  )
}
