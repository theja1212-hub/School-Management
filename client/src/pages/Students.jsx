import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const emptyForm = { name: '', rollNo: '', className: '', section: '', parentName: '', contact: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const load = async () => {
    try {
      const res = await api.get('/students', { params: { search } });
      setStudents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading students');
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addStudent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/students', form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add student');
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete');
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <div className="topbar">
        <h1>Students</h1>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>

      {error && <p className="error">{error}</p>}

      {isAdmin && (
        <form className="card form-row" onSubmit={addStudent}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="rollNo" placeholder="Roll No" value={form.rollNo} onChange={handleChange} required />
          <input name="className" placeholder="Class" value={form.className} onChange={handleChange} required />
          <input name="section" placeholder="Section" value={form.section} onChange={handleChange} required />
          <input name="parentName" placeholder="Parent name" value={form.parentName} onChange={handleChange} />
          <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} />
          <button type="submit">Add Student</button>
        </form>
      )}

      <input
        className="search"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No</th>
              <th>Class</th>
              <th>Section</th>
              <th>Parent</th>
              <th>Contact</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td>
                  <div className="name-cell">
                    <div className="avatar sm">{s.name.charAt(0).toUpperCase()}</div>
                    {s.name}
                  </div>
                </td>
                <td>{s.rollNo}</td>
                <td>{s.className}</td>
                <td>{s.section}</td>
                <td>{s.parentName}</td>
                <td>{s.contact}</td>
                {isAdmin && (
                  <td>
                    <button className="danger" onClick={() => deleteStudent(s._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="7">No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}