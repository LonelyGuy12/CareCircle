import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { ToastProvider } from './components/ui';
import Alerts from './pages/Alerts';
import Appointments from './pages/Appointments';
import Medications from './pages/Medications';
import Profile from './pages/Profile';
import Summaries from './pages/Summaries';
import Today from './pages/Today';
import { CareCircleProvider } from './state/care-circle';

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
