import { useEffect, useState } from 'react';
import { CalendarCheck, Check, X, Clock3, Video, Building2, Phone } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { subscribeAppointments, setAppointmentStatus, subscribeNutritionRequests } from '../../../lib/appointmentService';

export default function ReceptionOverview() {
  const [appointments, setAppointments] = useState([]);
  const [planRequests, setPlanRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => subscribeAppointments(setAppointments), []);
  useEffect(() => subscribeNutritionRequests(setPlanRequests), []);

  const todayList = appointments
    .filter((a) => a.date === selectedDate && a.status !== 'cancelled')
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));
  const modeLabel = { 'in-clinic': 'In-clinic', video: 'Video', phone: 'Phone' };
  const ModeIcon = ({ mode }) => mode === 'video' ? <Video size={13} /> : mode === 'phone' ? <Phone size={13} /> : <Building2 size={13} />;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-primary-dark flex items-center gap-2">
        <CalendarCheck size={20} /> Reception desk
      </h2>
      <p className="text-sm text-muted">Confirm bookings, protect 15-minute slots, and keep the doctor schedule clear.</p>
      <div className="flex items-center gap-3">
        <label htmlFor="reception-date" className="text-sm font-medium text-primary-dark">Schedule date</label>
        <input id="reception-date" type="date" className="input !w-auto !py-2" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
      </div>
      {todayList.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted">No bookings for this date. Patients can book from the landing-page chatbot.</Card>
      ) : (
        <div className="space-y-3">
          {todayList.map((a) => (
            <Card key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium flex items-center gap-2"><Clock3 size={15} className="text-primary" /> {a.time} · {a.name}</p>
                <p className="text-sm text-muted">{a.doctorName} · {a.healthConcern || a.program} · {a.phone}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary"><ModeIcon mode={a.consultationType} /> {modeLabel[a.consultationType] || 'Consultation'} · 15 minutes</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/20 capitalize">{a.status}</span>
                {a.status === 'pending' && (
                  <>
                    <button onClick={() => setAppointmentStatus(a.id, 'confirmed')} className="btn btn-primary !py-1.5 !px-3 !text-xs"><Check size={13} /> Confirm</button>
                    <button onClick={() => setAppointmentStatus(a.id, 'cancelled')} className="btn btn-outline !py-1.5 !px-3 !text-xs"><X size={13} /> Cancel</button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Card className="p-5"><h3 className="font-heading font-semibold text-primary-dark mb-3">Nutrition plan requests</h3>{planRequests.length === 0 ? <p className="text-sm text-muted">No plan requests.</p> : <div className="space-y-2">{planRequests.filter((request) => request.status !== 'cancelled').map((request) => <div key={request.id} className="flex items-center justify-between gap-3 rounded-lg border border-primary/15 px-3 py-2"><div><p className="text-sm font-medium">{request.patientName} · ID {request.patientId}</p><p className="text-xs text-muted">{request.planName} · {request.consultationType}</p></div><span className="text-xs capitalize text-primary">{request.status}</span></div>)}</div>}</Card>
    </div>
  );
}
