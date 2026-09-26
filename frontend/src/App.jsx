import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Today from './pages/Today.jsx'
import Medications from './pages/Medications.jsx'
import Appointments from './pages/Appointments.jsx'
import Summaries from './pages/Summaries.jsx'
import Alerts from './pages/Alerts.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Today />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/summaries" element={<Summaries />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
