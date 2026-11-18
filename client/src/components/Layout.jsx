import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GraduationCap, Users, CalendarCheck, FileText, Wallet,
  LogOut, Sun, Moon, Bell, Menu, ChevronsLeft, ChevronsRight, User,
} from 'lucide-react';
import IconBadge from './IconBadge';
import { SCHOOL } from '../config';

const titles = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/teachers': 'Teachers',
  '/attendance': 'Attendance',
  '/results': 'Results & Report Cards',
  '/fees': 'Fee Management',
};

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, staff: true },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/teachers', label: 'Teachers', icon: GraduationCap, staff: true },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, staff: true },
  { to: '/results', label: 'Results', icon: FileText },
  { to: '/fees', label: 'Fees', icon: Wallet },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const staff = user.role === 'admin' || user.role === 'teacher';

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState(null);
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

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const initial = (user.name || 'U').charAt(0).toUpperCase();

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''}`}>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-logo"><GraduationCap size={22} /></div>
          <div className="brand-text label">
            <b>{SCHOOL.name}</b>
            <small>Management Suite</small>
          </div>
        </div>

        <div className="menu-label">Menu</div>
        <nav className="side-links">
          {links.filter((l) => !l.staff || staff).map((l) => (
            <NavLink key={l.to} to={l.to}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <l.icon size={20} className="nav-ico" />
                  <span className="label">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
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
            <div>
              <span className="crumb">{SCHOOL.name}</span>
              <h2 className="page-title">{titles[pathname] || 'EduManage'}</h2>
            </div>
          </div>

          <div className="top-actions" ref={actionsRef}>
            <button type="button" className="icon-btn" title="Switch theme" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            <button type="button" className="icon-btn" onClick={() => setPanel(panel === 'bell' ? null : 'bell')}>
              <Bell size={19} />
              <span className="dot" />
            </button>

            <button type="button" className="profile-btn" onClick={() => setPanel(panel === 'profile' ? null : 'profile')}>
              <div className="avatar">{initial}</div>
              <div>
                <b>{user.name}</b>
                <small>{user.role}</small>
              </div>
            </button>

            <AnimatePresence>
              {panel === 'bell' && (
                <motion.div
                  key="bell"
                  className="dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <h3 style={{ margin: '6px 10px 8px', fontSize: 16 }}>Notifications</h3>
                  <div className="notif">
                    <IconBadge icon={Wallet} tone="orange" size={40} />
                    <div><b>Fee due soon</b><small>Some students have pending fees</small></div>
                  </div>
                  <div className="notif">
                    <IconBadge icon={FileText} tone="indigo" size={40} />
                    <div><b>Midterm exams</b><small>Upload marks before Friday</small></div>
                  </div>
                  <div className="notif">
                    <IconBadge icon={CalendarCheck} tone="red" size={40} />
                    <div><b>Low attendance</b><small>Check classes below 75%</small></div>
                  </div>
                </motion.div>
              )}

              {panel === 'profile' && (
                <motion.div
                  key="profile"
                  className="dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="dd-head">
                    <div className="avatar big">{initial}</div>
                    <div>
                      <b>{user.name}</b><br />
                      <small>{user.role}</small>
                    </div>
                  </div>
                  <button type="button" className="dd-item" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    {theme === 'light' ? 'Dark mode' : 'Light mode'}
                  </button>
                  <button type="button" className="dd-item">
                    <User size={18} /> My profile
                  </button>
                  <button type="button" className="dd-item red" onClick={askLogout}>
                    <LogOut size={18} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <motion.main
          key={pathname}
          className="content"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {children}
        </motion.main>
      </div>

      <AnimatePresence>
        {confirmOut && (
          <motion.div
            className="modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmOut(false)}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon"><LogOut size={28} /></div>
              <h3>Logout?</h3>
              <p>Are you sure you want to log out of {SCHOOL.name}?</p>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setConfirmOut(false)}>Cancel</button>
                <button type="button" className="btn-red" onClick={logout}>Yes, Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}