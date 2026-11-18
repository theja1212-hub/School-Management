import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, CalendarCheck, Wallet, Clock, UserPlus, ClipboardCheck,
  FileText, CreditCard, CalendarDays, ArrowRight, Inbox,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../services/api';
import CountUp from '../components/CountUp';
import IconBadge from '../components/IconBadge';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

const tipStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' };

const actions = [
  { to: '/students', label: 'Add student', sub: 'Register a new admission', icon: UserPlus, tone: 'indigo' },
  { to: '/attendance', label: 'Mark attendance', sub: "Take today's roll call", icon: ClipboardCheck, tone: 'green' },
  { to: '/results', label: 'Upload marks', sub: 'Create report cards', icon: FileText, tone: 'orange' },
  { to: '/fees', label: 'Collect fee', sub: 'Record a payment', icon: CreditCard, tone: 'pink' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error loading data'));
    api.get('/students', { params: { limit: 5 } })
      .then((res) => setRecent(res.data))
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const total = stats ? stats.feeCollected + stats.feePending : 0;
  const paidPct = total ? Math.round((stats.feeCollected / total) * 100) : 0;
  const feeData = stats
    ? [{ name: 'Collected', value: stats.feeCollected }, { name: 'Pending', value: stats.feePending }]
    : [];

  const cards = stats
    ? [
        { label: 'Total Students', value: stats.totalStudents, icon: Users, g: 'g1' },
        { label: 'Total Teachers', value: stats.totalTeachers, icon: GraduationCap, g: 'g2' },
        { label: 'Attendance', value: stats.attendancePercentage, suffix: '%', decimals: 1, icon: CalendarCheck, g: 'g3' },
        { label: 'Fees Collected', value: stats.feeCollected, prefix: '₹', icon: Wallet, g: 'g4' },
        { label: 'Fees Pending', value: stats.feePending, prefix: '₹', icon: Clock, g: 'g5' },
      ]
    : [];

  return (
    <div>
      <motion.div
        className="hero-card"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />
        <div>
          <h1>{greet}, {user.name}</h1>
          <p>Here is what is happening in your school today.</p>
        </div>
        <div className="date-chip"><CalendarDays size={18} /> {today}</div>
      </motion.div>

      {error && <p className="error">{error}</p>}

      {!stats && !error && (
        <div className="grid">
          {[1, 2, 3, 4, 5].map((n) => <div className="skeleton" key={n} />)}
        </div>
      )}

      {stats && (
        <motion.div variants={container} initial="hidden" animate="show">
          <div className="grid">
            {cards.map((c) => (
              <motion.div key={c.label} className={`stat ${c.g}`} variants={item} whileHover={{ y: -6 }}>
                <IconBadge icon={c.icon} tone="glass" size={46} />
                <h3>{c.label}</h3>
                <p><CountUp value={c.value} prefix={c.prefix} suffix={c.suffix} decimals={c.decimals} /></p>
              </motion.div>
            ))}
          </div>

          <div className="qa-grid">
            {actions.map((a) => (
              <motion.div key={a.to} variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                <Link to={a.to} className="qa">
                  <IconBadge icon={a.icon} tone={a.tone} size={46} />
                  <div>
                    <b>{a.label}</b>
                    <small>{a.sub}</small>
                  </div>
                  <ArrowRight size={18} className="arrow" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="charts">
            <motion.div className="card" variants={item}>
              <div className="card-title"><h2>Attendance Trend</h2><span className="sub">Last 7 days</span></div>
              {stats.weekly && stats.weekly.length > 0 ? (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.weekly}>
                      <defs>
                        <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6d5efc" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#6d5efc" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b855" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
                      <Tooltip contentStyle={tipStyle} />
                      <Area type="monotone" dataKey="percentage" stroke="#6d5efc" strokeWidth={3} fill="url(#att)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty">
                  <IconBadge icon={CalendarCheck} tone="indigo" size={56} />
                  <p>Mark attendance to see the trend here.</p>
                </div>
              )}
            </motion.div>

            <motion.div className="card" variants={item}>
              <div className="card-title"><h2>Fee Collection</h2></div>
              {total > 0 ? (
                <>
                  <div className="donut-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={feeData} dataKey="value" innerRadius={65} outerRadius={90} paddingAngle={4} stroke="none">
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip contentStyle={tipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center"><b>{paidPct}%</b><small>collected</small></div>
                  </div>
                  <div className="legend">
                    <span><i style={{ background: '#10b981' }} />Collected</span>
                    <span><i style={{ background: '#f59e0b' }} />Pending</span>
                  </div>
                </>
              ) : (
                <div className="empty">
                  <IconBadge icon={Wallet} tone="orange" size={56} />
                  <p>Add fees to see the chart.</p>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div className="card" variants={item}>
            <div className="card-title"><h2>Recently Added Students</h2></div>
            {recent.length === 0 && (
              <div className="empty" style={{ padding: 30 }}>
                <IconBadge icon={Inbox} tone="blue" size={56} />
                <p>No students yet.</p>
              </div>
            )}
            {recent.map((s) => (
              <div className="recent-item" key={s._id}>
                <div className="avatar">{s.name.charAt(0).toUpperCase()}</div>
                <div>
                  <b>{s.name}</b>
                  <small>Roll {s.rollNo}</small>
                </div>
                <span className="tag">Class {s.className}-{s.section}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}