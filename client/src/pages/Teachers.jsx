import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = { name: '', subject: '', qualification: '', experience: '', contact: '' };

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const load = async () => {
    try {
      const res = await api.get('/teachers', { params: { search } });
      setTeachers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading teachers');
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addTeacher = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/teachers', {
        ...form,
        experience: form.experience ? Number(form.experience) : undefined,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add teacher');
    }
  };

  const deleteTeacher = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete');
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Teachers</h1>

      {error && <p className="error">{error}</p>}

      <form className="card form-row" onSubmit={addTeacher}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} />
        <input name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleChange} />
        <input name="experience" type="number" min="0" placeholder="Experience (years)" value={form.experience} onChange={handleChange} />
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} />
        <button type="submit">Add Teacher</button>
      </form>

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
              <th>Subject</th>
              <th>Qualification</th>
              <th>Experience</th>
              <th>Contact</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id}>
                <td>{t.name}</td>
                <td>{t.subject}</td>
                <td>{t.qualification}</td>
                <td>{t.experience !== undefined ? `${t.experience} yrs` : ''}</td>
                <td>{t.contact}</td>
                {isAdmin && (
                  <td>
                    <button className="danger" onClick={() => deleteTeacher(t._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr><td colSpan="6">No teachers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}