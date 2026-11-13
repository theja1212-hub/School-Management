import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const emptyMarks = { examName: '', subject: '', marks: '', maxMarks: 100 };

export default function Results() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [form, setForm] = useState(emptyMarks);
  const [exam, setExam] = useState('');
  const [card, setCard] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canUpload = user.role === 'admin' || user.role === 'teacher';

  useEffect(() => {
    api
      .get('/students', { params: { limit: 200 } })
      .then((res) => setStudents(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error loading students'));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const loadCard = async (id = studentId, examName = exam) => {
    if (!id) return;
    setError('');
    try {
      const res = await api.get(`/results/student/${id}`, {
        params: examName ? { exam: examName } : {},
      });
      setCard(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading report card');
    }
  };

  const addMarks = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!studentId) return setError('Please select a student first');
    try {
      await api.post('/results', {
        student: studentId,
        examName: form.examName,
        subject: form.subject,
        marks: Number(form.marks),
        maxMarks: Number(form.maxMarks),
      });
      setMessage('Marks saved ✅');
      setForm({ ...emptyMarks, examName: form.examName });
      loadCard(studentId, exam);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save marks');
    }
  };

  const selected = students.find((s) => s._id === studentId);

  return (
    <div style={{ padding: 30 }}>
      <div className="topbar">
        <h1>Results &amp; Report Card</h1>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card form-row">
        <select
          value={studentId}
          onChange={(e) => {
            setStudentId(e.target.value);
            setCard(null);
            if (e.target.value) loadCard(e.target.value, exam);
          }}
        >
          <option value="">-- Select student --</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} (Roll {s.rollNo}, {s.className}-{s.section})
            </option>
          ))}
        </select>
        <input
          placeholder="Filter by exam (optional)"
          value={exam}
          onChange={(e) => setExam(e.target.value)}
        />
        <button type="button" onClick={() => loadCard()}>Show Report Card</button>
      </div>

      {canUpload && (
        <form className="card form-row" onSubmit={addMarks}>
          <input name="examName" placeholder="Exam (e.g. Midterm)" value={form.examName} onChange={handleChange} required />
          <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />
          <input name="marks" type="number" min="0" placeholder="Marks" value={form.marks} onChange={handleChange} required />
          <input name="maxMarks" type="number" min="1" placeholder="Max marks" value={form.maxMarks} onChange={handleChange} required />
          <button type="submit">Add Marks</button>
        </form>
      )}

      {card && (
        <div className="card table-wrap" style={{ marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>
            Report Card{selected ? `: ${selected.name}` : ''}
          </h2>
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Max</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {card.subjects.map((r, i) => (
                <tr key={i}>
                  <td>{r.exam}</td>
                  <td>{r.subject}</td>
                  <td>{r.marks}</td>
                  <td>{r.maxMarks}</td>
                  <td>{r.grade}</td>
                </tr>
              ))}
              {card.subjects.length === 0 && (
                <tr><td colSpan="5">No marks uploaded yet</td></tr>
              )}
            </tbody>
          </table>
          <div className="summary">
            <span>Total: <b>{card.totalMarks} / {card.maxMarks}</b></span>
            <span>Percentage: <b>{card.percentage}%</b></span>
            <span>Grade: <b>{card.grade}</b></span>
          </div>
          <button type="button" style={{ marginTop: 15 }} onClick={() => window.print()}>
            Print Report Card
          </button>
        </div>
      )}
    </div>
  );
}