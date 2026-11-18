import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import api from '../services/api';
import { SCHOOL } from '../config';

const emptyFee = { type: 'tuition', amount: '', dueDate: '' };
const emptyPay = { amount: '', method: 'cash', note: '' };

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '-');
const paidOf = (f) => (f.status === 'paid' ? f.amount : f.paidAmount || 0);
const balanceOf = (f) => Math.max(f.amount - paidOf(f), 0);

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [form, setForm] = useState(emptyFee);
  const [filter, setFilter] = useState('');
  const [payFee, setPayFee] = useState(null);
  const [payForm, setPayForm] = useState(emptyPay);
  const [payError, setPayError] = useState('');
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

  const loadPayments = async () => {
    try {
      const res = await api.get('/payments', { params: filter ? { student: filter } : {} });
      setPayments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading payments');
    }
  };

  const refresh = () => {
    loadFees();
    loadPayments();
  };

  useEffect(() => {
    api
      .get('/students', { params: { limit: 200 } })
      .then((res) => setStudents(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadFees();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [filter]);

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

  const deleteFee = async (id) => {
    if (!window.confirm('Delete this fee and all its payment history?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/fees/${id}`);
      setMessage('Fee deleted');
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete fee');
    }
  };

  const openPay = (f) => {
    setPayFee(f);
    setPayForm({ ...emptyPay, amount: balanceOf(f) });
    setPayError('');
  };

  const savePayment = async (e) => {
    e.preventDefault();
    setPayError('');
    try {
      const res = await api.post('/payments', {
        fee: payFee._id,
        amount: Number(payForm.amount),
        method: payForm.method,
        note: payForm.note,
      });
      setPayFee(null);
      setReceipt(res.data);
      setMessage('Payment added ✅');
      refresh();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setPayError(err.response?.data?.message || 'Could not add payment');
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/payments/${id}`);
      if (receipt && receipt._id === id) setReceipt(null);
      setMessage('Payment deleted');
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete payment');
    }
  };

  const viewReceipt = (p) => {
    setReceipt(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className={receipt ? 'has-receipt' : ''}>
      <div className="topbar">
        <div>
          <h1>Fees</h1>
          <p className="sub">Manage fees, record payments and view payment history.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {receipt && (
        <div className="card receipt">
          <div className="receipt-head">
            <h2>{SCHOOL.name}</h2>
            <small>{SCHOOL.address}</small>
          </div>
          <h3 style={{ textAlign: 'center', margin: '0 0 10px' }}>Fee Receipt</h3>
          <p><span>Receipt No</span><b>{receipt.receiptNo}</b></p>
          <p><span>Date</span><b>{fmt(receipt.paidDate)}</b></p>
          <p><span>Student</span><b>{receipt.student?.name}</b></p>
          <p>
            <span>Roll / Class</span>
            <b>{receipt.student?.rollNo} / {receipt.student?.className}-{receipt.student?.section}</b>
          </p>
          <p><span>Fee Type</span><b style={{ textTransform: 'capitalize' }}>{receipt.fee?.type}</b></p>
          <p><span>Method</span><b style={{ textTransform: 'uppercase' }}>{receipt.method}</b></p>
          <p><span>Amount Paid</span><b>₹{receipt.amount}</b></p>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button type="button" onClick={() => window.print()}>Print</button>
            <button type="button" className="btn-ghost" onClick={() => setReceipt(null)}>Close</button>
          </div>
        </div>
      )}

      {isAdmin && (
        <form className="card form-row hide-print" onSubmit={addFee}>
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

      <div className="card table-wrap hide-print">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Balance</th>
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
                <td>₹{paidOf(f)}</td>
                <td>₹{balanceOf(f)}</td>
                <td>{fmt(f.dueDate)}</td>
                <td><span className={`badge ${f.status}`}>{f.status}</span></td>
                {isAdmin && (
                  <td>
                    <div className="actions">
                      {f.status !== 'paid' && (
                        <button type="button" className="btn-sm" onClick={() => openPay(f)}>
                          <Plus size={14} /> Pay
                        </button>
                      )}
                      <button type="button" className="danger btn-sm" onClick={() => deleteFee(f._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {fees.length === 0 && (
              <tr><td colSpan="8">No fees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="section-head hide-print">
        <div>
          <h2>Payment History</h2>
          <p className="sub">Total received: <b>₹{totalReceived}</b></p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All students</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>{s.name} (Roll {s.rollNo})</option>
          ))}
        </select>
      </div>

      <div className="card table-wrap hide-print">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Receipt No</th>
              <th>Student</th>
              <th>Fee</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{fmt(p.paidDate)}</td>
                <td>{p.receiptNo}</td>
                <td>{p.student?.name || '-'}</td>
                <td style={{ textTransform: 'capitalize' }}>{p.fee?.type || '-'}</td>
                <td>₹{p.amount}</td>
                <td style={{ textTransform: 'uppercase' }}>{p.method}</td>
                <td>
                  <div className="actions">
                    <button type="button" className="btn-sm" onClick={() => viewReceipt(p)}>
                      <Eye size={14} /> Receipt
                    </button>
                    {isAdmin && (
                      <button type="button" className="danger btn-sm" onClick={() => deletePayment(p._id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan="7">No payments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {payFee && (
        <div className="modal-bg" onClick={() => setPayFee(null)}>
          <div className="modal left" onClick={(e) => e.stopPropagation()}>
            <h3>Add Payment</h3>
            <p>
              {payFee.student?.name} · <span style={{ textTransform: 'capitalize' }}>{payFee.type}</span> · Balance ₹{balanceOf(payFee)}
            </p>
            <form className="modal-form" onSubmit={savePayment}>
              <label>Amount (₹)</label>
              <input
                type="number"
                min="1"
                max={balanceOf(payFee)}
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                required
              />
              <label>Payment method</label>
              <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank">Bank transfer</option>
              </select>
              <label>Note (optional)</label>
              <input
                placeholder="e.g. First instalment"
                value={payForm.note}
                onChange={(e) => setPayForm({ ...payForm, note: e.target.value })}
              />
              {payError && <p className="error" style={{ margin: 0 }}>{payError}</p>}
              <div className="modal-actions" style={{ marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setPayFee(null)}>Cancel</button>
                <button type="submit">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}