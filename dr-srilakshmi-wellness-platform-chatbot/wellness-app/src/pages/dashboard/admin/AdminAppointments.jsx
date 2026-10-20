import { useEffect, useState } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Clock3, Video, Building2, Phone } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { subscribeAppointments } from '../../../lib/appointmentService';

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-secondary/30 text-primary-dark',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  useEffect(() => subscribeAppointments(setAppointments), []);

  const monthLabel = month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, index) => {
    if (index < firstDay) return null;
    const day = index - firstDay + 1;
    const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { day, iso, bookings: appointments.filter((a) => a.date === iso && a.status !== 'cancelled') };
  });
  const modeLabel = { 'in-clinic': 'In-clinic', video: 'Video', phone: 'Phone' };
  const ModeIcon = ({ mode }) => mode === 'video' ? <Video size={13} /> : mode === 'phone' ? <Phone size={13} /> : <Building2 size={13} />;

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-primary-dark mb-6 flex items-center gap-2">
        <CalendarCheck size={20} /> All Appointments
      </h2>
      <Card className="p-4 md:p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="w-9 h-9 rounded-lg border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5" aria-label="Previous month"><ChevronLeft size={17} /></button>
          <h3 className="font-heading font-bold text-primary-dark">{monthLabel}</h3>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="w-9 h-9 rounded-lg border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5" aria-label="Next month"><ChevronRight size={17} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day} className="py-1">{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, index) => cell ? (
            <div key={cell.iso} className={`min-h-20 rounded-lg border p-1.5 text-left ${cell.bookings.length ? 'border-primary/40 bg-primary/5' : 'border-gray-100 bg-gray-50/60'}`}>
              <p className="text-xs font-semibold text-primary-dark">{cell.day}</p>
              <div className="mt-1 space-y-1">
                {cell.bookings.slice(0, 2).map((booking) => <div key={booking.id} className="rounded bg-white px-1 py-0.5 text-[10px] text-ink truncate" title={`${booking.time} · ${booking.doctorName}`}><span className="font-semibold">{booking.time}</span> {booking.name}</div>)}
                {cell.bookings.length > 2 && <p className="text-[10px] text-primary font-semibold">+{cell.bookings.length - 2} more</p>}
              </div>
            </div>
          ) : <div key={`blank-${index}`} className="min-h-20" />)}
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/10 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium">Doctor</th>
              <th className="px-5 py-3 font-medium">Concern</th>
              <th className="px-5 py-3 font-medium">Mode</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No appointments yet.</td></tr>
            ) : appointments.filter((a) => a.status !== 'cancelled').map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3 font-medium">{a.name}</td>
                <td className="px-5 py-3 text-muted">{a.doctorName || '—'}</td>
                <td className="px-5 py-3 text-muted">{a.healthConcern || a.program}</td>
                <td className="px-5 py-3 text-muted"><span className="inline-flex items-center gap-1"><ModeIcon mode={a.consultationType} /> {modeLabel[a.consultationType] || 'Consultation'}</span></td>
                <td className="px-5 py-3 text-muted">{a.date}</td>
                <td className="px-5 py-3 text-muted">{a.time}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusColor[a.status] || statusColor.pending}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
