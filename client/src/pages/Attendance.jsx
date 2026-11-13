import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Attendance() {
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadClass = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const sRes = await api.get('/students', {
        params: { className, section, limit: 200 },
      });
      const aRes = await api.get(`/attendance/date/${date}`);

      const saved = {};
      aRes.data.forEach((a) => {
        saved[a.student] = a.status;
      });

      const map = {};
      sRes.data.forEach((s) => {
        map[s._id] = saved[s._id] || 'present';
      });

      setStudents(sRes.data);
      setStatus(map);
      if (sRes.data.length === 0) setError('No students found in this class');
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading class');
    }
  };

  const setOne = (id, value) => setStatus({ ...status, [id]: value });

  const markAll = (value) => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = value;
    });
    setStatus(map);
  };

  const save = async () => {
    setError('');
    setMessage('');
    try {
      const records = students.map((s) => ({ student: s._id, status: status[s._id] }));
      await api.post('/attendance', { date, records });
      setMessage('Attendance saved ✅');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save');
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <div className="topbar">
        <h1>Attendance</h1>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>

      <form className="card form-row" onSubmit={loadClass}>
        <input placeholder="Class (e.g. 10)" value={className} onChange={(e) => setClassName(e.target.value)} required />
        <input placeholder="Section (e.g. A)" value={section} onChange={(e) => setSection(e.target.value)} required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <button type="submit">Load Class</button>
      </form>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {students.length > 0 && (
        <div className="card table-wrap">
          <div style={{ marginBottom: 15 }}>
            <button type="button" onClick={() => markAll('present')}>All Present</button>{' '}
            <button type="button" className="danger" onClick={() => markAll('absent')}>All Absent</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.rollNo}</td>
                  <td>{s.name}</td>
                  <td>
                    {['present', 'absent', 'late'].map((v) => (
                      <label key={v} className="radio-label">
                        <input
                          type="radio"
                          name={s._id}
                          checked={status[s._id] === v}
                          onChange={() => setOne(s._id, v)}
                        />
                        {v}
                      </label>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 15 }}>
            <button type="button" onClick={save}>Save Attendance</button>
          </div>
        </div>
      )}
    </div>
  );
}