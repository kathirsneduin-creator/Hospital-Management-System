import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FileText, Plus, Clock3, Video, Building2, Phone } from 'lucide-react';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import { doctors } from '../../../data/doctors';
import { subscribeAppointments, createPrescription, subscribePrescriptions } from '../../../lib/appointmentService';

const MEDICINES = ['Arnica Montana 30C', 'Nux Vomica 30C', 'Rhus Tox 30C', 'Bryonia 30C', 'Apis Mellifica 30C', 'Natrum Mur 30C', 'Calcarea Carb 30C', 'Kali Phos 6X'];

export default function DoctorPrescriptions() {
  const { currentUser, userProfile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [issued, setIssued] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ patientId: '', items: [{ medicine: '', quantity: '', dosage: '', instructions: '' }] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let unsub1 = () => {};
    const unsubAppointments = subscribeAppointments(setAppointments);
    const unsubLocalPrescriptions = subscribePrescriptions(setIssued);
    try {
      if (db) unsub1 = onSnapshot(query(collection(db, 'users'), where('role', '==', 'patient')), (snap) => setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    } catch {
      // Local appointment data remains available in demo mode.
    }
    return () => { unsub1(); unsubAppointments(); unsubLocalPrescriptions(); };
  }, []);

  const doctorId = userProfile?.doctorId || currentUser?.doctorId;
  const doctor = doctors.find((item) => item.id === doctorId) || doctors[0];
  const bookedPatients = appointments
    .filter((appointment) => (!doctorId || appointment.doctorId === doctorId) && ['confirmed', 'completed'].includes(appointment.status))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const patientOptions = bookedPatients.length ? bookedPatients : patients.map((patient) => ({ ...patient, patientId: patient.id }));
  const modeLabel = { 'in-clinic': 'In-clinic', video: 'Video', phone: 'Phone' };
  const ModeIcon = ({ mode }) => mode === 'video' ? <Video size={13} /> : mode === 'phone' ? <Phone size={13} /> : <Building2 size={13} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.items.some((item) => item.medicine)) return;
    setSaving(true);
    try {
      await createPrescription({
        patientId: form.patientId,
        items: form.items.filter((item) => item.medicine),
        patientName: patientOptions.find((patient) => (patient.patientId || patient.id) === form.patientId)?.name || '',
        patientAge: patientOptions.find((patient) => (patient.patientId || patient.id) === form.patientId)?.age || '',
        patientPhone: patientOptions.find((patient) => (patient.patientId || patient.id) === form.patientId)?.phone || '',
        consultationDate: patientOptions.find((patient) => (patient.patientId || patient.id) === form.patientId)?.date || new Date().toISOString().slice(0, 10),
        doctorId: doctorId || currentUser.uid,
        doctorName: userProfile?.name || 'Dr. Srilakshmi',
      });
      setForm({ patientId: '', items: [{ medicine: '', quantity: '', dosage: '', instructions: '' }] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
      <Card className="p-6 h-fit">
        <div className="flex items-center gap-3 mb-5">
          <img src={doctor.photo} alt={doctor.name} className="w-14 h-14 rounded-full img-stroke object-cover" />
          <div><h3 className="font-heading font-semibold text-primary-dark flex items-center gap-2"><FileText size={18} /> Issue Prescription</h3><p className="text-xs text-muted mt-1">{doctor.name} · {doctor.specialization}</p></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Patient</label>
            <select className="input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
              <option value="">Select booked patient</option>
              {patientOptions.map((p) => <option key={p.id || p.patientId} value={p.patientId || p.id}>{p.name} · Age {p.age || '—'} · {p.healthConcern || 'consultation'} · {p.date} {p.time}</option>)}
            </select>
            {bookedPatients.length > 0 && <p className="mt-1.5 text-xs text-primary flex items-center gap-1"><Clock3 size={12} /> Showing booked patients and consultation times</p>}
          </div>
          <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Medicines and instructions</label><button type="button" className="btn btn-outline !py-1.5 !px-2.5 !text-xs" onClick={() => setForm({ ...form, items: [...form.items, { medicine: '', quantity: '', dosage: '', instructions: '' }] })}><Plus size={13} /> Add medicine</button></div>
            {form.items.map((item, index) => <div key={index} className="rounded-lg border border-primary/15 p-3 space-y-2"><div className="flex gap-2"><input className="input flex-1" list="medicine-list" value={item.medicine} onChange={(e) => setForm({ ...form, items: form.items.map((row, rowIndex) => rowIndex === index ? { ...row, medicine: e.target.value } : row) })} placeholder="Medicine, yoga, or treatment" required={index === 0} /><input className="input w-24" value={item.quantity} onChange={(e) => setForm({ ...form, items: form.items.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: e.target.value } : row) })} placeholder="Qty" />{form.items.length > 1 && <button type="button" className="btn btn-outline !px-2" onClick={() => setForm({ ...form, items: form.items.filter((_, rowIndex) => rowIndex !== index) })}>×</button>}</div><input className="input" list="instruction-list" value={item.dosage} onChange={(e) => setForm({ ...form, items: form.items.map((row, rowIndex) => rowIndex === index ? { ...row, dosage: e.target.value } : row) })} placeholder="Dosage or instruction" /><textarea className="input min-h-14" value={item.instructions} onChange={(e) => setForm({ ...form, items: form.items.map((row, rowIndex) => rowIndex === index ? { ...row, instructions: e.target.value } : row) })} placeholder="Additional instructions" /></div>)}
            <datalist id="medicine-list">{MEDICINES.map((medicine) => <option key={medicine} value={medicine} />)}</datalist><datalist id="instruction-list"><option value="Take after meals" /><option value="Take before meals" /><option value="Twice daily" /><option value="Once daily" /><option value="Practice for 20 minutes daily" /><option value="Continue for 2 weeks" /></datalist>
          </div>
          <button className="btn btn-primary w-full" disabled={saving}>
            <Plus size={16} /> {saving ? 'Issuing...' : 'Issue Prescription'}
          </button>
        </form>
      </Card>

      <div>
        <h3 className="font-heading font-semibold text-primary-dark mb-4">Recently Issued</h3>
        {issued.length === 0 ? (
          <Card className="p-10 text-center"><p className="text-muted text-sm">No prescriptions issued yet.</p></Card>
        ) : (
          <div className="space-y-3">
            {issued.map((p) => (
              <Card key={p.id} className="p-4">
                <p className="font-medium text-sm">{(p.items || [{ medicine: p.medicine, dosage: p.dosage }]).map((item) => `${item.medicine}${item.quantity ? ` · Qty ${item.quantity}` : ''}`).join(', ')}</p>
                <p className="text-xs text-muted mt-1">{(p.items || []).map((item) => item.dosage || item.instructions).filter(Boolean).join(' · ') || p.dosage}</p>
                <p className="text-xs text-muted mt-2 border-t border-gray-100 pt-2">For patient: {p.patientName || patients.find((pt) => pt.id === p.patientId)?.name || p.patientId}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
