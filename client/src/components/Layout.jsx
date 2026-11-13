import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, Users, CalendarCheck, FileText, Wallet,
  LogOut, Sun, Moon, Bell, Menu, ChevronsLeft, ChevronsRight, User,
} from 'lucide-react';

const titles = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/teachers': 'Teachers',
  '/attendance': 'Attendance',
  '/results': 'Results & Report Cards',
  '/fees': 'Fee Management',
};

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const staff = user.role === 'admin' || user.role === 'teacher';

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState(null); // null | 'bell' | 'profile'
  const [confirmOut, setConfirmOut] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
    setPanel(null);
  }, [pathname]);

  useEffect(() => {
    const close = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) setPanel(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const logout = () => {
    const keepTheme = localStorage.getItem('theme') || 'light';
    localStorage.clear();
    localStorage.setItem('theme', keepTheme);
    navigate('/');
  };

  const askLogout = () => {
    setPanel(null);
    setConfirmOut(true);
  };

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''}`}>
      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-logo"><GraduationCap size={22} /></div>
          <span className="label">EduManage</span>
        </div>

        <div className="menu-label">Menu</div>
        <nav className="side-links">
          {staff && <NavLink to="/dashboard"><LayoutDashboard size={20} /><span className="label">Dashboard</span></NavLink>}
          <NavLink to="/students"><Users size={20} /><span className="label">Students</span></NavLink>
          {staff && <NavLink to="/teachers"><GraduationCap size={20} /><span className="label">Teachers</span></NavLink>}
          {staff && <NavLink to="/attendance"><CalendarCheck size={20} /><span className="label">Attendance</span></NavLink>}
          <NavLink to="/results"><FileText size={20} /><span className="label">Results</span></NavLink>
          <NavLink to="/fees"><Wallet size={20} /><span className="label">Fees</span></NavLink>
        </nav>

        <div className="side-bottom">
          <button type="button" className="side-logout" onClick={askLogout}>
            <LogOut size={18} /> <span className="label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <div className="header-left">
            <button type="button" className="icon-btn menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <button type="button" className="icon-btn collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </button>
            <h2 className="page-title">{titles[pathname] || 'EduManage'}</h2>
          </div>

          <div className="top-actions" ref={actionsRef}>
            <button
              type="button"
              className="icon-btn"
              title="Switch theme"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            <button type="button" className="icon-btn" onClick={() => setPanel(panel === 'bell' ? null : 'bell')}>
              <Bell size={19} />
              <span className="dot" />
            </button>

            <button type="button" className="profile-btn" onClick={() => setPanel(panel === 'profile' ? null : 'profile')}>
              <div className="avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <b>{user.name}</b>
                <small>{user.role}</small>
              </div>
            </button>

            {panel === 'bell' && (
              <div className="dropdown">
                <h3 style={{ margin: '6px 10px 8px', fontSize: 16 }}>Notifications</h3>
                <div className="notif">
                  <div className="notif-icon" style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b' }}><Wallet size={18} /></div>
                  <div><b>Fee due soon</b><small>3 students have pending fees</small></div>
                </div>
                <div className="notif">
                  <div className="notif-icon" style={{ background: 'rgba(99,102,241,.15)', color: '#6366f1' }}><FileText size={18} /></div>
                  <div><b>Midterm exams</b><small>Upload marks before Friday</small></div>
                </div>
                <div className="notif">
                  <div className="notif-icon" style={{ background: 'rgba(239,68,68,.15)', color: '#ef4444' }}><CalendarCheck size={18} /></div>
                  <div><b>Low attendance</b><small>Class 10-A is below 75%</small></div>
                </div>
              </div>
            )}

            {panel === 'profile' && (
              <div className="dropdown">
                <div className="dd-head">
                  <div className="avatar big">{(user.name || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <b>{user.name}</b><br />
                    <small>{user.role}</small>
                  </div>
                </div>
                <button type="button" className="dd-item btn-ghost" style={{ border: 'none', background: 'transparent' }}
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  {theme === 'light' ? 'Dark mode' : 'Light mode'}
                </button>
                <button type="button" className="dd-item" style={{ background: 'transparent' }}>
                  <User size={18} /> My profile
                </button>
                <button type="button" className="dd-item red" style={{ background: 'transparent' }} onClick={askLogout}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="content">{children}</main>
      </div>

      {confirmOut && (
        <div className="modal-bg" onClick={() => setConfirmOut(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon"><LogOut size={28} /></div>
            <h3>Logout?</h3>
            <p>Are you sure you want to log out of EduManage?</p>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setConfirmOut(false)}>Cancel</button>
              <button type="button" className="btn-red" onClick={logout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}