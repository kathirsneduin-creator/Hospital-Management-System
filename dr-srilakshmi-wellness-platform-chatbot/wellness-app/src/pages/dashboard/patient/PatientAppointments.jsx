import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock3, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import { subscribeAppointments } from '../../../lib/appointmentService';
import { setAppointmentStatus } from '../../../lib/appointmentService';
import { sendBookingNotification } from '../../../lib/notifications';
import { googleCalendarUrl } from '../../../lib/googleCalendar';
import { patientText } from '../../../data/translations';

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-secondary/30 text-primary-dark',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function PatientAppointments() {
  const { currentUser, userProfile, language } = useAuth();
  const text = patientText[language];
  const [appointments, setAppointments] = useState([]);
  const [cancelling, setCancelling] = useState('');

  useEffect(() => subscribeAppointments(setAppointments), []);

  const patientId = userProfile?.patientId || currentUser?.patientId || currentUser?.uid;
  const mine = appointments.filter((a) => a.status !== 'cancelled' && (a.patientId ? a.patientId === patientId : a.phone === userProfile?.phone));

  async function cancelAppointment(appointment) {
    setCancelling(appointment.id);
    await setAppointmentStatus(appointment.id, 'cancelled');
    try {
      await sendBookingNotification({
        mobile: appointment.phone,
        whatsapp: appointment.whatsapp || appointment.phone,
        message: `Dr. Srilakshmi Clinic: your consultation on ${appointment.date} at ${appointment.time} with ${appointment.doctorName} has been cancelled. You may book this date and time again.`,
      });
    } catch (error) {
      console.warn('Cancellation saved, but notification delivery failed:', error.message);
    } finally {
      setCancelling('');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold text-primary-dark">{text.myAppointments}</h2>
        <Link to="/#book" className="btn btn-primary !text-sm">
          <CalendarCheck size={16} /> {text.bookNew}
        </Link>
      </div>

      {mine.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted">{text.noAppointments}</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {mine.map((a) => {
            const cal = a.calendarUrl || googleCalendarUrl({
              title: `Consultation with ${a.doctorName || 'clinic'}`,
              date: a.date,
              time: a.time,
            });
            return (
              <Card key={a.id} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-heading font-semibold text-primary-dark">{a.healthConcern || a.program}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusColor[a.status] || statusColor.pending}`}>{a.status}</span>
                </div>
                <p className="text-sm text-muted">{a.doctorName}</p>
                <p className="text-sm text-muted flex items-center gap-1.5 mt-1"><CalendarCheck size={14} /> {a.date}</p>
                <p className="text-sm text-muted flex items-center gap-1.5 mt-1"><Clock3 size={14} /> {a.time} · 15 min</p>
                {a.status !== 'cancelled' && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a href={cal} target="_blank" rel="noreferrer" className="btn btn-outline !py-2 !text-xs"><ExternalLink size={12} /> {text.calendar}</a>
                    <button type="button" onClick={() => cancelAppointment(a)} disabled={cancelling === a.id} className="btn btn-outline !py-2 !text-xs">{cancelling === a.id ? text.cancelling : text.cancel}</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
