import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(res.data.user.role === 'student' ? '/students' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot reach server');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <GraduationCap size={56} />
        <h1>Smart School<br />Management</h1>
        <p>Manage students, teachers, attendance, exams and fees from one beautiful place.</p>
        <ul className="auth-points">
          <li>✅ Attendance in one click</li>
          <li>📊 Automatic report cards</li>
          <li>💳 Fee tracking with receipts</li>
        </ul>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Welcome back 👋</h2>
          <p className="sub">Sign in to your school account</p>
          {error && <p className="error">{error}</p>}

          <label>Email</label>
          <input type="email" placeholder="admin@school.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <div className="pass-wrap">
            <input type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className="eye" onClick={() => setShow(!show)}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}