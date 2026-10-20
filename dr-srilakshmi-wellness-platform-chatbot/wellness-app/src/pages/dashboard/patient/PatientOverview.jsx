import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, BookOpen, FileText, Salad, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { patientText } from '../../../data/translations';
import { Card } from '../../../components/ui/Card';
import { liveSessions } from '../../../data/content';
import { subscribeAppointments } from '../../../lib/appointmentService';
import { getJournal, subscribeLocal, getUsers } from '../../../lib/localDb';

export default function PatientOverview() {
  const { currentUser, userProfile, language } = useAuth();
  const text = patientText[language];
  const [appointments, setAppointments] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => subscribeAppointments(setAppointments), []);
  useEffect(() => subscribeLocal(() => {
    const mine = getJournal().filter((j) => j.patientId === currentUser?.uid);
    setLatest(mine[0] || null);
  }), [currentUser]);

  const mine = appointments.filter((a) => a.patientId === currentUser?.uid || a.phone === userProfile?.phone);
  const upcoming = mine.filter((a) => a.status !== 'completed' && a.status !== 'cancelled').slice(0, 3);

  const quickLinks = [
    { to: '/dashboard/patient/appointments', label: text.appointments, icon: CalendarCheck, count: mine.length },
    { to: '/dashboard/patient/journal', label: text.progress, icon: BookOpen },
    { to: '/dashboard/patient/prescriptions', label: text.prescriptions, icon: FileText },
    { to: '/dashboard/patient/nutrition', label: text.nutrition, icon: Salad },
  ];

  const recovery = Number(latest?.recovery || 0);
  const familyProfiles = userProfile?.uid ? getUsers().filter((item) => item.familyOwnerId === userProfile.uid) : [];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickLinks.map((q) => (
          <Link key={q.to} to={q.to}>
            <Card className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{q.label}</p>
                <p className="font-heading font-bold text-2xl text-primary-dark mt-1">{q.count ?? '—'}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-secondary/20 flex items-center justify-center">
                <q.icon className="text-primary" size={20} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs text-muted uppercase tracking-wide">{text.patientId}</p><p className="font-heading text-2xl font-bold text-primary-dark">{userProfile?.patientId || '—'}</p></div>
        <div><p className="text-xs text-muted">Mobile username</p><p className="text-sm font-semibold">{userProfile?.phone || '—'}</p></div>
        <div><p className="text-xs text-muted">Family profiles on this mobile</p><p className="text-sm font-semibold">{familyProfiles.length} profile{familyProfiles.length === 1 ? '' : 's'}</p></div>
      </Card>

      {latest && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-primary-dark mb-3">Wellness recovery</h3>
          <div className="h-3 rounded-full bg-secondary/20">
            <div className="h-3 rounded-full bg-primary" style={{ width: `${recovery}%` }} />
          </div>
          <p className="text-sm text-muted mt-2">{recovery}% · Weight {latest.weight} kg · Energy {latest.energy} · Sleep {latest.sleep}</p>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-primary-dark">{text.appointments}</h3>
            <Link to="/dashboard/patient/appointments" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted">No appointments yet.</p>
              <Link to="/#book" className="btn btn-primary mt-4 inline-flex">{text.bookNew}</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center justify-between border-2 border-primary/15 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{a.healthConcern || a.program}</p>
                    <p className="text-xs text-muted">{a.date} · {a.time}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/20 text-primary-dark capitalize">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-semibold text-primary-dark mb-4">{text.todaysSession}</h3>
          <p className="font-medium text-sm">{liveSessions.today.title}</p>
          <p className="text-xs text-muted mt-1">{liveSessions.today.date} · {liveSessions.today.time}</p>
          <Link to="/dashboard/patient/sessions" className="btn btn-primary w-full mt-4">{text.joinMeet}</Link>
        </Card>
      </div>
    </div>
  );
}
