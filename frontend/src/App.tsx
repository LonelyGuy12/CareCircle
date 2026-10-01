import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Today from './pages/Today.tsx';
import Medications from './pages/Medications.tsx';
import Appointments from './pages/Appointments.tsx';
import Summaries from './pages/Summaries.tsx';
import Alerts from './pages/Alerts.tsx';
import Profile from './pages/Profile.tsx';

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
    );
}
