import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const emptyFee = { type: 'tuition', amount: '', dueDate: '' };

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [form, setForm] = useState(emptyFee);
  const [receipt, setReceipt] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const loadFees = async () => {
    try {
      const res = await api.get('/fees', { params: { limit: 200 } });
      setFees(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading fees');
    }
  };

  useEffect(() => {
    loadFees();
    api
      .get('/students', { params: { limit: 200 } })
      .then((res) => setStudents(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addFee = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!studentId) return setError('Please select a student');
    try {
      await api.post('/fees', {
        student: studentId,
        type: form.type,
        amount: Number(form.amount),
        dueDate: form.dueDate || undefined,
      });
      setMessage('Fee added ✅');
      setForm(emptyFee);
      loadFees();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add fee');
    }
  };

  const markPaid = async (id) => {
    setError('');
    setMessage('');
    try {
      const res = await api.post(`/fees/${id}/pay`);
      setReceipt(res.data);
      loadFees();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark as paid');
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '-');

  return (
    <div style={{ padding: 30 }}>
      <div className="topbar">
        <h1>Fees</h1>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {isAdmin && (
        <form className="card form-row" onSubmit={addFee}>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">-- Select student --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} (Roll {s.rollNo}, {s.className}-{s.section})
              </option>
            ))}
          </select>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="tuition">Tuition</option>
            <option value="transport">Transport</option>
            <option value="hostel">Hostel</option>
          </select>
          <input name="amount" type="number" min="1" placeholder="Amount (₹)" value={form.amount} onChange={handleChange} required />
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
          <button type="submit">Add Fee</button>
        </form>
      )}

      {receipt && (
        <div className="card receipt">
          <h2 style={{ marginTop: 0 }}>Fee Receipt</h2>
          <p>Receipt No: <b>{receipt.receiptNo}</b></p>
          <p>Student: <b>{receipt.student}</b> (Roll {receipt.rollNo})</p>
          <p>Fee Type: <b>{receipt.feeType}</b></p>
          <p>Amount Paid: <b>₹{receipt.amount}</b></p>
          <p>Date: <b>{fmt(receipt.paidDate)}</b></p>
          <button type="button" onClick={() => window.print()}>Print Receipt</button>{' '}
          <button type="button" className="danger" onClick={() => setReceipt(null)}>Close</button>
        </div>
      )}

      <div className="card table-wrap" style={{ marginTop: 20 }}>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f._id}>
                <td>{f.student?.name || '-'}</td>
                <td style={{ textTransform: 'capitalize' }}>{f.type}</td>
                <td>₹{f.amount}</td>
                <td>{fmt(f.dueDate)}</td>
                <td>
                  <span className={f.status === 'paid' ? 'badge paid' : 'badge pending'}>
                    {f.status}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    {f.status === 'pending' ? (
                      <button type="button" onClick={() => markPaid(f._id)}>Mark Paid</button>
                    ) : (
                      '-'
                    )}
                  </td>
                )}
              </tr>
            ))}
            {fees.length === 0 && (
              <tr><td colSpan="6">No fees found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}