import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Today from './pages/Today';
import Medications from './pages/Medications';
import Appointments from './pages/Appointments';
import Summaries from './pages/Summaries';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import { CareCircleProvider } from './state/care-circle';
import { ToastProvider } from './components/ui';

export default function App() {
    return (
        <CareCircleProvider>
            <ToastProvider>
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
            </ToastProvider>
        </CareCircleProvider>
    );
}
