import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarCheck, FileText, TrendingUp, Check, X, Clock3, Plus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { subscribeAppointments, subscribeNutritionRequests, subscribePrescriptions, setNutritionRequestStatus, setAppointmentStatus, createPrescription } from '../../../lib/appointmentService';
import { sendBookingNotification } from '../../../lib/notifications';
import { useAuth } from '../../../context/AuthContext';

export default function DoctorOverview() {
  const { userProfile, currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [planRequests, setPlanRequests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [prescriptionForm, setPrescriptionForm] = useState({ items: [{ medicine: '', quantity: '', dosage: '', instructions: '' }] });
  const [savingPrescription, setSavingPrescription] = useState(false);

  useEffect(() => subscribeAppointments(setAppointments), []);
  useEffect(() => subscribeNutritionRequests(setPlanRequests), []);
  useEffect(() => subscribePrescriptions(setPrescriptions), []);

  const doctorId = userProfile?.doctorId || currentUser?.doctorId;
  const mine = appointments.filter((a) => !doctorId || a.doctorId === doctorId);
  const visibleAppointments = mine.filter((a) => a.status !== 'cancelled');
  const requests = visibleAppointments.filter((a) => a.status === 'pending').slice(0, 6);
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = mine.filter((a) => a.date === today && a.status !== 'cancelled').length;
  const pendingCount = mine.filter((a) => a.status === 'pending').length;
  const uniquePatients = new Set(mine.map((a) => a.patientId || a.phone).filter(Boolean)).size;
  const cancelledCount = mine.filter((a) => a.status === 'cancelled').length;
  const doctorPrescriptions = prescriptions.filter((p) => !doctorId || p.doctorId === doctorId).slice(0, 5);

  async function savePlanPrescription(request) {
    if (!prescriptionForm.items.some((item) => item.medicine)) return;
    setSavingPrescription(true);
    await createPrescription({
      patientId: request.patientId,
      patientName: request.patientName,
      patientPhone: request.patientPhone,
      items: prescriptionForm.items.filter((item) => item.medicine),
      consultationDate: request.consultationDate,
      doctorId: doctorId || currentUser?.uid,
      doctorName: userProfile?.name || 'Doctor',
      planRequestId: request.id,
    });
    setPrescriptionForm({ items: [{ medicine: '', quantity: '', dosage: '', instructions: '' }] });
    setSavingPrescription(false);
  }

  const stats = [
    { label: "Today's Appointments", value: todayCount, icon: CalendarCheck },
    { label: 'Pending Confirmations', value: pendingCount, icon: TrendingUp },
    { label: 'Total Patients', value: uniquePatients, icon: Users },
    { label: 'Total Bookings', value: appointments.length, icon: FileText },
    { label: 'Cancelled', value: cancelledCount, icon: X },
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

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-primary-dark">Recent Appointment Requests</h3>
          <Link to="/dashboard/doctor/appointments" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {requests.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">No pending appointment requests.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {requests.map((a) => (
              <li key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{a.name}</p>
                  <p className="text-xs text-muted flex items-center gap-1"><Clock3 size={11} /> {a.healthConcern || a.program} · {a.date} at {a.time}</p>
                </div>
                <div className="flex gap-2"><button type="button" onClick={() => setAppointmentStatus(a.id, 'confirmed')} className="btn btn-primary !py-1.5 !px-3 !text-xs"><Check size={13} /> Confirm</button><button type="button" onClick={() => setAppointmentStatus(a.id, 'cancelled')} className="btn btn-outline !py-1.5 !px-3 !text-xs"><X size={13} /> Decline</button></div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-heading font-semibold text-primary-dark">Prescription follow-up</h3><Link to="/dashboard/doctor/prescriptions" className="text-sm text-primary hover:underline">Open prescriptions</Link></div>
        {doctorPrescriptions.length === 0 ? <p className="text-sm text-muted text-center py-4">Issue a prescription after confirming a consultation.</p> : <ul className="divide-y divide-gray-100">{doctorPrescriptions.map((prescription) => <li key={prescription.id} className="py-3 flex items-center justify-between gap-3"><div><p className="text-sm font-medium">{prescription.patientName || prescription.patientId}</p><p className="text-xs text-muted">{prescription.medicine} · {prescription.consultationDate || 'Today'}</p></div><span className="text-xs text-primary">Patient ID {prescription.patientId}</span></li>)}</ul>}
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-heading font-semibold text-primary-dark">Nutrition plan approvals</h3><span className="text-xs text-muted">{planRequests.filter((request) => request.status === 'pending').length} pending</span></div>
        {planRequests.length === 0 ? <p className="text-sm text-muted">No nutrition plan requests yet.</p> : <div className="space-y-3">{planRequests.filter((request) => request.status !== 'stopped').slice(0, 6).map((request) => { const consultationAppointment = mine.find((appointment) => appointment.patientId === request.patientId && appointment.date === request.consultationDate && appointment.time === request.consultationTime && appointment.status !== 'cancelled'); const consultationConfirmed = consultationAppointment && ['confirmed', 'completed'].includes(consultationAppointment.status); const hasPrescription = prescriptions.some((prescription) => prescription.planRequestId === request.id || (prescription.patientId === request.patientId && prescription.consultationDate === request.consultationDate)); return <div key={request.id} className="rounded-xl border-2 border-primary/15 px-4 py-3"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><button type="button" disabled={!consultationConfirmed} onClick={() => setSelectedPatient(selectedPatient === request.id ? '' : request.id)} className={`text-sm font-semibold text-left ${consultationConfirmed ? 'text-primary hover:underline' : 'text-ink'}`}>{request.patientName} · ID {request.patientId}</button><p className="text-xs text-muted">{request.planName} · {request.consultationType} · {request.consultationDate} {request.consultationTime} · ₹{request.price}/month</p>{request.status === 'pending' && !consultationConfirmed && <p className="text-[11px] text-amber-700 mt-1">Confirm the consultation first.</p>}{consultationConfirmed && !hasPrescription && <p className="text-[11px] text-primary mt-1">Click the patient name to open prescription.</p>}</div>{request.status === 'pending' ? <div className="flex gap-2">{!consultationConfirmed && <button type="button" disabled={!consultationAppointment} onClick={() => setAppointmentStatus(consultationAppointment.id, 'confirmed')} className="btn btn-outline !py-2 !text-xs">Confirm consultation</button>}<button type="button" disabled={!consultationConfirmed || !hasPrescription} onClick={async () => { await setNutritionRequestStatus(request.id, 'active'); try { await sendBookingNotification({ mobile: request.patientPhone, whatsapp: request.patientPhone, message: `Your ${request.planName} is now active after doctor approval. Patient ID: ${request.patientId}.` }); } catch { /* saved even if notifications are unavailable */ } }} className="btn btn-primary !py-2 !text-xs">Activate plan</button></div> : request.status === 'active' ? <button type="button" onClick={() => setNutritionRequestStatus(request.id, 'inactive')} className="btn btn-outline !py-2 !text-xs">Mark inactive</button> : <span className="text-xs rounded-full bg-amber-50 px-2.5 py-1 capitalize text-amber-800">{request.status}</span>}</div>{selectedPatient === request.id && consultationConfirmed && <div className="mt-3 grid gap-2 rounded-lg bg-secondary/10 p-3"><p className="text-xs font-semibold text-primary-dark">Prescription for {request.patientName}</p>{prescriptionForm.items.map((item, index) => <div key={index} className="flex gap-2"><input className="input !py-2 flex-1" placeholder="Medicine or treatment" value={item.medicine} onChange={(event) => setPrescriptionForm({ ...prescriptionForm, items: prescriptionForm.items.map((row, rowIndex) => rowIndex === index ? { ...row, medicine: event.target.value } : row) })} /><input className="input !py-2 w-24" placeholder="Qty" value={item.quantity} onChange={(event) => setPrescriptionForm({ ...prescriptionForm, items: prescriptionForm.items.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: event.target.value } : row) })} /><input className="input !py-2" placeholder="Instructions" value={item.instructions} onChange={(event) => setPrescriptionForm({ ...prescriptionForm, items: prescriptionForm.items.map((row, rowIndex) => rowIndex === index ? { ...row, instructions: event.target.value } : row) })} /></div>)}<button type="button" className="btn btn-outline !py-2 !text-xs" onClick={() => setPrescriptionForm({ ...prescriptionForm, items: [...prescriptionForm.items, { medicine: '', quantity: '', dosage: '', instructions: '' }] })}><Plus size={13} /> Add item</button><button type="button" disabled={savingPrescription || !prescriptionForm.items.some((item) => item.medicine)} onClick={() => savePlanPrescription(request)} className="btn btn-primary !py-2 !text-xs"><Plus size={13} /> {savingPrescription ? 'Saving prescription...' : 'Save prescription'}</button></div>}</div>; })}</div>}
      </Card>
    </div>
  );
}
