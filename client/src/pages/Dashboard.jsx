import { useEffect, useState } from 'react';
import { Users, GraduationCap, CalendarCheck, Wallet, Clock } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from '../services/api';

const tipStyle = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)',
};

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
    ? [
        { name: 'Collected', value: stats.feeCollected },
        { name: 'Pending', value: stats.feePending },
      ]
    : [];

  return (
    <div>
      <div className="hero">
        <div>
          <h1>{greet}, {user.name} 👋</h1>
          <p className="sub">Here is what is happening in your school today.</p>
        </div>
        <div className="date-chip">📅 {today}</div>
      </div>

      {error && <p className="error">{error}</p>}

      {stats && (
        <>
          <div className="grid">
            <div className="stat g1">
              <div className="stat-icon"><Users size={24} /></div>
              <h3>Total Students</h3><p>{stats.totalStudents}</p>
            </div>
            <div className="stat g2">
              <div className="stat-icon"><GraduationCap size={24} /></div>
              <h3>Total Teachers</h3><p>{stats.totalTeachers}</p>
            </div>
            <div className="stat g3">
              <div className="stat-icon"><CalendarCheck size={24} /></div>
              <h3>Attendance</h3><p>{stats.attendancePercentage}%</p>
            </div>
            <div className="stat g4">
              <div className="stat-icon"><Wallet size={24} /></div>
              <h3>Fees Collected</h3><p>₹{stats.feeCollected}</p>
            </div>
            <div className="stat g5">
              <div className="stat-icon"><Clock size={24} /></div>
              <h3>Fees Pending</h3><p>₹{stats.feePending}</p>
            </div>
          </div>

          <div className="charts">
            <div className="card">
              <div className="card-title"><h2>Attendance Trend</h2><span className="sub">Last 7 days</span></div>
              {stats.weekly && stats.weekly.length > 0 ? (
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.weekly}>
                      <defs>
                        <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b855" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
                      <Tooltip contentStyle={tipStyle} />
                      <Area type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={3} fill="url(#att)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="empty">Mark attendance to see the trend here.</p>
              )}
            </div>

            <div className="card">
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
                <p className="empty">Add fees to see the chart.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title"><h2>Recently Added Students</h2></div>
            {recent.length === 0 && <p className="empty" style={{ padding: 20 }}>No students yet.</p>}
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
          </div>
        </>
      )}
    </div>
  );
}