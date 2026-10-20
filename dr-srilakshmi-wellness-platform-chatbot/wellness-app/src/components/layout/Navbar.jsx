import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CalendarCheck, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import TopBar from './TopBar';
import LoginRoleMenu from './LoginRoleMenu';
import { useAuth } from '../../context/AuthContext';
import { dashboardPath } from '../../lib/roles';
import { publicText } from '../../data/translations';

const linkKeys = [
  { hash: 'home', key: 'home' },
  { hash: 'programs', key: 'programs' },
  { hash: 'live-sessions', key: 'liveSessions' },
  { hash: 'nutrition', key: 'nutrition' },
  { hash: 'about', key: 'about' },
  { hash: 'contact', key: 'contact' },
];

function SectionLink({ hash, label, className, onClick }) {
  const loc = useLocation();
  const to = `/#${hash}`;
  const active = loc.pathname === '/' && loc.hash === `#${hash}`;
  if (loc.pathname === '/') {
    return (
      <a href={`#${hash}`} onClick={onClick} className={typeof className === 'function' ? className({ isActive: active }) : className}>
        {label}
      </a>
    );
  }
  return (
    <Link to={to} onClick={onClick} className={typeof className === 'function' ? className({ isActive: false }) : className}>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, role, logout, language, theme } = useAuth();
  const text = publicText[language];
  const links = linkKeys.map((link) => ({ ...link, label: text[link.key] }));
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    `pb-1 border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-ink/80 border-transparent hover:text-primary'}`;

  const openBooking = (event) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { mode: 'booking' } }));
  };

  return (
    <header className="sticky top-0 z-50">
      <TopBar />
      <nav className={`transition-all duration-300 ${theme === 'dark' ? 'bg-[#15251b]/95 text-white shadow-md backdrop-blur-glass' : scrolled ? 'bg-white/95 shadow-md backdrop-blur-glass' : 'bg-white'}`}>
        <div className="container-app flex items-center gap-7 overflow-x-auto py-3">
          <a href="/#home" className="flex min-w-[235px] shrink-0 items-center gap-2" aria-label="Dr. Srilakshmi Homeo & Yoga Clinic home">
            <img src="/logo.png" alt="" className="h-11 w-11 object-contain img-stroke rounded-full bg-white p-0.5" />
            <div className="leading-tight">
              <p className="font-heading font-bold text-primary-dark text-lg tracking-tight">DR. SRILAKSHMI</p>
              <p className="font-heading font-semibold text-primary text-xs tracking-widest -mt-0.5">HOMEO &amp; YOGA CLINIC</p>
            </div>
          </a>

          <ul className="flex min-w-max flex-1 items-center gap-4 font-medium text-xs">
            {links.map((l) => (
              <li key={l.hash}>
                <SectionLink hash={l.hash} label={l.label} className={navClass} />
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            {!currentUser && (
              <>
                <LoginRoleMenu variant="desktop" />
                <Link to="/register" className="btn btn-outline !px-3 text-sm">
                  <UserPlus size={16} /> {text.register}
                </Link>
              </>
            )}
            {currentUser && (
              <div className="flex items-center gap-2">
                <Link to={dashboardPath(role)} className="btn btn-outline !px-3 text-sm">
                  <LayoutDashboard size={16} /> {text.dashboard}
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost !px-3 text-sm">
                  <LogOut size={16} /> {text.logout}
                </button>
              </div>
            )}
              <a href="/#book" onClick={openBooking} className="btn btn-primary text-sm">
              <CalendarCheck size={16} /> {text.book}
            </a>
          </div>

        </div>
      </nav>
    </header>
  );
}
