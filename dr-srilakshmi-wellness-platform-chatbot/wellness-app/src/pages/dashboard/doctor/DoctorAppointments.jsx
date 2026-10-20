import { useEffect, useState } from 'react';
import { CalendarCheck, Check, X } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { subscribeAppointments, subscribeNutritionRequests, setAppointmentStatus, createAppointment } from '../../../lib/appointmentService';
import { useAuth } from '../../../context/AuthContext';

const tabs = ['all', 'pending', 'confirmed', 'completed'];

export default function DoctorAppointments() {
  const { userProfile, currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [planRequests, setPlanRequests] = useState([]);
  const [tab, setTab] = useState('all');

  useEffect(() => subscribeAppointments(setAppointments), []);
  useEffect(() => subscribeNutritionRequests(setPlanRequests), []);

  const doctorId = userProfile?.doctorId || currentUser?.doctorId;
  const mine = appointments.filter((a) => a.status !== 'cancelled' && (!doctorId || a.doctorId === doctorId));
  const filtered = tab === 'all' ? mine : mine.filter((a) => a.status === tab);
  const nutritionAppointments = planRequests
    .filter((request) => request.status === 'pending' || request.status === 'active' || request.status === 'inactive')
    .map((request) => ({
      request,
      appointment: mine.find((appointment) => appointment.planRequestId === request.id || (
        appointment.patientId === request.patientId &&
        appointment.date === request.consultationDate &&
        appointment.time === request.consultationTime
      )),
    }));

  async function confirmNutritionAppointment(request, appointment) {
    if (appointment) {
      await setAppointmentStatus(appointment.id, 'confirmed');
      return;
    }
    await createAppointment({
      name: request.patientName,
      phone: request.patientPhone,
      patientId: request.patientId,
      doctorId: doctorId || 'dr-srilakshmi',
      doctorName: userProfile?.name || 'Doctor',
      date: request.consultationDate,
      time: request.consultationTime,
      consultationType: request.consultationType,
      healthConcern: `${request.planName} consultation`,
      program: request.planName,
      planRequestId: request.id,
      durationMin: 15,
      status: 'confirmed',
      source: 'nutrition-plan-repair',
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-heading text-xl font-bold text-primary-dark flex items-center gap-2">
          <CalendarCheck size={20} /> Appointments
        </h2>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                tab === t ? 'bg-primary text-white' : 'bg-secondary/10 text-ink/70 hover:bg-secondary/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-primary-dark">Nutrition plan appointments</h3>
          <span className="text-xs text-muted">{nutritionAppointments.length} request{nutritionAppointments.length === 1 ? '' : 's'}</span>
        </div>
        {nutritionAppointments.length === 0 ? <p className="text-sm text-muted">No nutrition plan appointments.</p> : <div className="space-y-3">{nutritionAppointments.map(({ request, appointment }) => <div key={request.id} className="rounded-xl border-2 border-primary/15 p-4"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-sm font-semibold">{request.patientName} · Patient ID {request.patientId}</p><p className="text-xs text-muted mt-1">{request.planName} · {request.consultationType} · {request.consultationDate} at {request.consultationTime}</p>{!appointment && <p className="text-xs text-amber-700 mt-1">Confirm to create the linked consultation appointment.</p>}</div><div className="flex items-center gap-2">{appointment && <span className="text-xs rounded-full bg-secondary/20 px-2.5 py-1 capitalize text-primary-dark">{appointment.status}</span>}{request.status === 'pending' && (!appointment || appointment.status === 'pending') && <button type="button" onClick={() => confirmNutritionAppointment(request, appointment)} className="btn btn-primary !py-2 !px-3 !text-xs"><Check size={13} /> Confirm consultation</button>}</div></div></div>)}</div>}
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center"><p className="text-muted text-sm">No appointments in this category.</p></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium">{a.name} <span className="text-muted font-normal">· {a.healthConcern || a.program}</span></p>
                <p className="text-sm text-muted mt-0.5">{a.date} at {a.time} (15 min) · {a.phone}</p>
                <p className="text-xs text-primary mt-1 capitalize">{a.consultationType || 'consultation'} consultation</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/20 text-primary-dark capitalize">{a.status}</span>
                {a.status === 'pending' && (
                  <>
                    <button onClick={() => setAppointmentStatus(a.id, 'confirmed')} className="btn btn-primary !py-1.5 !px-3 !text-xs">
                      <Check size={13} /> Confirm
                    </button>
                    <button onClick={() => setAppointmentStatus(a.id, 'cancelled')} className="btn btn-outline !py-1.5 !px-3 !text-xs">
                      <X size={13} /> Decline
                    </button>
                  </>
                )}
                {a.status === 'confirmed' && (
                  <button onClick={() => setAppointmentStatus(a.id, 'completed')} className="btn btn-outline !py-1.5 !px-3 !text-xs">
                    Mark Completed
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
