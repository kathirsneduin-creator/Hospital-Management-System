import { useEffect, useState } from 'react';
import { Users, CalendarCheck, Stethoscope, TrendingUp, ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { subscribeAppointments } from '../../../lib/appointmentService';

export default function AdminOverview() {
  const { subscribeUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => subscribeUsers(setUsers), [subscribeUsers]);
  useEffect(() => subscribeAppointments(setAppointments), []);

  const patients = users.filter((u) => u.role === 'patient').length;
  const doctors = users.filter((u) => u.role === 'doctor').length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const upcoming = appointments
    .filter((a) => a.status !== 'cancelled')
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 5);

  const stats = [
    { label: 'Total Patients', value: patients, icon: Users },
    { label: 'Doctors', value: doctors, icon: Stethoscope },
    { label: 'Total Appointments', value: appointments.length, icon: CalendarCheck },
    { label: 'Pending Requests', value: pending, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">{s.label}</p>
              <p className="font-heading font-bold text-2xl text-primary-dark mt-1">{s.value}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-secondary/20 flex items-center justify-center">
              <s.icon className="text-primary" size={20} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-primary-dark">Upcoming schedule</h3>
            <Link to="/dashboard/admin/appointments" className="text-xs text-primary font-semibold inline-flex items-center gap-1">Calendar <ArrowRight size={13} /></Link>
          </div>
          {upcoming.length === 0 ? <p className="text-sm text-muted text-center py-6">No appointments yet.</p> : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((a) => <li key={a.id} className="py-3 flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-medium text-sm truncate">{a.name} · {a.doctorName}</p><p className="text-xs text-muted flex items-center gap-1 mt-1"><Clock3 size={11} /> {a.date} · {a.time} · {a.consultationType || 'consultation'}</p></div><span className="text-xs px-2.5 py-1 rounded-full bg-secondary/20 text-primary-dark capitalize shrink-0">{a.status}</span></li>)}
            </ul>
          )}
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="font-heading font-semibold text-primary-dark">Recent sign-ups</h3><Link to="/dashboard/admin/users" className="text-xs text-primary font-semibold">Manage</Link></div>
          {users.length === 0 ? <p className="text-sm text-muted text-center py-6">No users yet.</p> : <ul className="divide-y divide-gray-100">{users.slice(0, 5).map((u) => <li key={u.id || u.uid} className="py-2.5 flex items-center justify-between gap-2"><span className="text-sm font-medium truncate">{u.name}</span><span className="text-xs text-muted capitalize">{u.role}</span></li>)}</ul>}
        </Card>
      </div>
    </div>
  );
}
