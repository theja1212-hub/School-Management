import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Eye, EyeOff, Mail, Lock, ArrowRight, ClipboardCheck, TrendingUp, Receipt,
} from 'lucide-react';
import api from '../services/api';
import IconBadge from '../components/IconBadge';
import { SCHOOL } from '../config';

const features = [
  { icon: ClipboardCheck, tone: 'green', title: 'One-click attendance', text: 'Mark a whole class in seconds' },
  { icon: TrendingUp, tone: 'orange', title: 'Automatic report cards', text: 'Grades and percentages, instantly' },
  { icon: Receipt, tone: 'pink', title: 'Fee tracking', text: 'Payments, history and receipts' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(res.data.user.role === 'student' ? '/students' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="orb o1" />
        <div className="orb o2" />

        <motion.div className="auth-brand" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
          <IconBadge icon={GraduationCap} tone="glass" size={46} />
          {SCHOOL.name}
        </motion.div>

        <div className="auth-hero">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
            Run your school,<br />beautifully.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            Students, teachers, attendance, exams and fees, all managed from one modern dashboard.
          </motion.p>

          <div className="auth-features">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.5 }}
              >
                <div className="auth-feature">
                  <IconBadge icon={f.icon} tone={f.tone} size={44} />
                  <div>
                    <b>{f.title}</b>
                    <small>{f.text}</small>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="auth-foot">{SCHOOL.name} &middot; Management Suite</div>
      </div>

      <div className="auth-right">
        <motion.form
          className="auth-form"
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <h2>Welcome back</h2>
          <p className="sub">Sign in to continue to your dashboard</p>
          {error && <p className="error">{error}</p>}

          <label>Email</label>
          <div className="field">
            <Mail size={18} className="lead" />
            <input type="email" placeholder="you@school.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <label>Password</label>
          <div className="field">
            <Lock size={18} className="lead" />
            <input
              type={show ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="eye" onClick={() => setShow(!show)}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn-block" disabled={loading}>
            {loading ? <span className="spinner" /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </motion.form>
      </div>
    </div>
  );
}