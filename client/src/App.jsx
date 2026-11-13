import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Fees from './pages/Fees';
import Layout from './components/Layout';

function Protected({ children }) {
  if (!localStorage.getItem('token')) return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/students" element={<Protected><Students /></Protected>} />
      <Route path="/teachers" element={<Protected><Teachers /></Protected>} />
      <Route path="/attendance" element={<Protected><Attendance /></Protected>} />
      <Route path="/results" element={<Protected><Results /></Protected>} />
      <Route path="/fees" element={<Protected><Fees /></Protected>} />
    </Routes>
  );
}