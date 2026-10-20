import { NavLink, Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, CalendarCheck, BookOpen, FileText, Salad, Users, BarChart3,
  LogOut, Home, Video, ClipboardList, Activity, Bell, LockKeyhole, UserCircle, Receipt,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, dashboardPath } from '../../lib/roles';
import { getActivities, subscribeLocal } from '../../lib/localDb';
import { patientText } from '../../data/translations';

const navByRole = {
  patient: [
    { to: '/dashboard/patient', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/patient/activity', label: 'Recent Activity', icon: Activity },
    { to: '/dashboard/patient/appointments', label: 'Appointments', icon: CalendarCheck },
    { to: '/dashboard/patient/journal', label: 'Progress', icon: BookOpen },
    { to: '/dashboard/patient/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/dashboard/patient/nutrition', label: 'Nutrition Plan', icon: Salad },
    { to: '/dashboard/patient/sessions', label: 'Live Sessions', icon: Video },
    { to: '/dashboard/patient/settings', label: 'Settings', icon: LockKeyhole },
    { to: '/dashboard/patient/invoices', label: 'Invoices', icon: Receipt },
  ],
  doctor: [
    { to: '/dashboard/doctor', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/doctor/appointments', label: 'Appointments', icon: CalendarCheck },
    { to: '/dashboard/doctor/patients', label: 'Patients', icon: Users },
    { to: '/dashboard/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/dashboard/doctor/content', label: 'Content & Sessions', icon: Video },
  ],
  admin: [
    { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/admin/users', label: 'Staff & Users', icon: Users },
    { to: '/dashboard/admin/appointments', label: 'Appointments', icon: CalendarCheck },
    { to: '/dashboard/admin/analytics', label: 'Reports', icon: BarChart3 },
  ],
  receptionist: [
    { to: '/dashboard/receptionist', label: 'Front Desk', icon: LayoutDashboard, end: true },
    { to: '/dashboard/receptionist/appointments', label: 'Bookings', icon: CalendarCheck },
  ],
  worker: [
    { to: '/dashboard/worker', label: 'Floor Tasks', icon: ClipboardList, end: true },
    { to: '/dashboard/worker/medical', label: 'Medical Desk', icon: FileText },
    { to: '/dashboard/worker/invoices', label: 'Invoices', icon: Receipt },
  ],
};

function notificationText(item, language) {
  if (language !== 'ta') return item;
  const titles = { 'Patient account created': 'நோயாளர் கணக்கு உருவாக்கப்பட்டது', 'Password changed': 'கடவுச்சொல் மாற்றப்பட்டது', 'Mobile number added': 'மொபைல் எண் சேர்க்கப்பட்டது', 'Family member added': 'குடும்ப உறுப்பினர் சேர்க்கப்பட்டார்', 'Consultation booked': 'ஆலோசனை முன்பதிவு செய்யப்பட்டது', 'Prescription issued': 'மருந்துச் சீட்டு வழங்கப்பட்டது', 'Nutrition plan requested': 'ஊட்டச்சத்து திட்டம் கோரப்பட்டது' };
  return { ...item, title: titles[item.title] || item.title.replace('Appointment ', 'சந்திப்பு ').replace('Nutrition plan ', 'ஊட்டச்சத்து திட்டம் '), detail: item.detail.replace('Patient ID:', 'நோயாளர் அடையாள எண்:').replace('Username:', 'பயனர் பெயர்:').replace('Doctor', 'மருத்துவர்').replace('consultation', 'ஆலோசனை') };
}

export default function DashboardShell({ role }) {
  const { userProfile, logout, currentUser, language } = useAuth();
  const items = navByRole[role] || [];
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const text = role === 'patient' ? patientText[language] : patientText.en;

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', localStorage.getItem('dsw-theme') === 'dark');
  }, []);

  useEffect(() => subscribeLocal(() => {
    const patientId = userProfile?.patientId || currentUser?.patientId || currentUser?.uid;
    const relevant = role === 'patient'
      ? getActivities().filter((item) => item.patientId === patientId || item.phone === userProfile?.phone)
      : role === 'doctor' ? getActivities().filter((item) => item.type === 'booking') : getActivities();
    setActivities(relevant.slice(0, 8));
  }), [role, currentUser, userProfile]);

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-primary-dark text-white">
        <Link to="/" className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <img src="/logo.png" alt="" className="h-9 w-9 bg-white rounded-full p-1 img-stroke" />
          <div className="leading-tight">
            <p className="font-heading font-bold text-sm">DR. SRILAKSHMI</p>
            <p className="text-[10px] text-secondary-light tracking-widest">HOMEO &amp; YOGA CLINIC</p>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive ? 'bg-white text-primary-dark font-semibold' : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              <item.icon size={17} /> {role === 'patient' ? ({ Overview: text.overview, 'Recent Activity': text.activity, Appointments: text.appointments, Progress: text.progress, Prescriptions: text.prescriptions, 'Nutrition Plan': text.nutrition, 'Live Sessions': text.sessions, Settings: text.settings }[item.label] || item.label) : item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/10">
            <Home size={17} /> {role === 'patient' ? text.backToWebsite : 'Back to Website'}
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/10">
            <LogOut size={17} /> {role === 'patient' ? text.logout : 'Logout'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b-2 border-primary/15 px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">{role === 'patient' ? text.dashboard : `${ROLE_LABELS[role] || role} Dashboard`}</p>
              <h1 className="font-heading font-bold text-lg text-primary-dark">
                {role === 'patient' ? text.welcome : 'Welcome'}, {userProfile?.name || currentUser?.displayName || ROLE_LABELS[role]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to={dashboardPath(role)} className="md:hidden text-sm text-primary font-medium">{role === 'patient' ? text.menu : 'Menu'}</Link>
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen((value) => !value)} className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20 text-primary hover:bg-primary/5" aria-label={text.notifications} aria-expanded={notificationsOpen}>
                <Bell size={18} />
                {activities.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{activities.length}</span>}
              </button>
              {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-2 border-primary/15 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-primary/10 px-4 py-3"><p className="font-heading text-sm font-semibold text-primary-dark">{text.notifications}</p><span className="text-xs text-muted">{activities.length} {text.recent}</span></div>{activities.length === 0 ? <p className="px-4 py-6 text-center text-sm text-muted">{text.noNotifications}</p> : <div className="max-h-80 overflow-y-auto">{activities.slice(0, 5).map((item) => { const translated = notificationText(item, language); return role === 'patient' && item.type === 'prescription' ? <Link to="/dashboard/patient/prescriptions" onClick={() => setNotificationsOpen(false)} key={item.id} className="block border-b border-gray-100 px-4 py-3 hover:bg-primary/5"><p className="text-sm font-semibold text-primary-dark">{translated.title}</p><p className="mt-0.5 text-xs leading-relaxed text-ink">{translated.detail}</p><p className="mt-1 text-[10px] text-muted">{new Date(item.createdAt).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN')}</p></Link> : <div key={item.id} className="border-b border-gray-100 px-4 py-3"><p className="text-sm font-semibold text-primary-dark">{translated.title}</p><p className="mt-0.5 text-xs leading-relaxed text-ink">{translated.detail}</p><p className="mt-1 text-[10px] text-muted">{new Date(item.createdAt).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN')}</p></div>; })}</div>}<Link to={role === 'patient' ? '/dashboard/patient/activity' : dashboardPath(role)} onClick={() => setNotificationsOpen(false)} className="block border-t border-primary/10 px-4 py-3 text-center text-xs font-semibold text-primary hover:bg-primary/5">{text.openNotifications}</Link></div>}
            </div>
            <div className="relative"><button type="button" onClick={() => setProfileOpen((value) => !value)} className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-primary-dark font-heading font-semibold border-2 border-primary" aria-label={role === 'patient' ? text.settings : 'Open profile menu'}><UserCircle size={20} /></button>{profileOpen && <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border-2 border-primary/15 bg-white p-4 shadow-2xl"><p className="font-semibold text-primary-dark">{userProfile?.name || currentUser?.email}</p><p className="mt-1 text-xs text-muted">{text.patientId}: {userProfile?.patientId || '—'}</p><p className="text-xs text-muted">{text.username}: {userProfile?.phone || '—'}</p><Link to={role === 'patient' ? '/dashboard/patient/settings' : dashboardPath(role)} onClick={() => setProfileOpen(false)} className="btn btn-outline mt-3 w-full !py-2 !text-xs">{role === 'patient' ? text.settings : 'Settings'}</Link></div>}</div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
