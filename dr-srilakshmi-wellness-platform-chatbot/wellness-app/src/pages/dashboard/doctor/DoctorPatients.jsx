import { useEffect, useState } from 'react';
import { Users, Mail, Phone, UserPlus, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';

export default function DoctorPatients() {
  const { subscribeUsers, createPatientAccount, removePatientAccount } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', age: '', phone: '', email: '', address: '', gender: '' });

  useEffect(() => {
    const unsub = subscribeUsers((users) => {
      setPatients(users.filter((user) => user.role === 'patient'));
      setLoading(false);
    });
    return unsub;
  }, [subscribeUsers]);

  async function addPatient(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const created = await createPatientAccount(form);
      setNotice(`Patient created. Patient ID: ${created.patientId} · Login password: ${created.tempPassword}`);
      setForm({ name: '', age: '', phone: '', email: '', address: '', gender: '' });
    } catch (error) {
      setNotice(error.message || 'Could not create patient.');
    } finally {
      setSaving(false);
    }
  }

  async function removePatient(patient) {
    if (!window.confirm(`Remove patient ${patient.name || patient.patientId} and their clinic data?`)) return;
    await removePatientAccount(patient);
    setNotice('Patient account and clinic records removed.');
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-primary-dark mb-6 flex items-center gap-2">
        <Users size={20} /> Patients
      </h2>
      <Card className="p-6 mb-6">
        <h3 className="font-heading font-semibold text-primary-dark mb-1 flex items-center gap-2"><UserPlus size={18} /> Add patient</h3>
        <p className="text-xs text-muted mb-4">Create a patient ID and temporary password for a patient who cannot register online.</p>
        <form onSubmit={addPatient} className="grid sm:grid-cols-2 gap-3">
          <input className="input" required placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className="input" required type="number" min="1" max="120" placeholder="Age" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
          <input className="input" required placeholder="Mobile number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <input className="input" type="email" placeholder="Email (optional)" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="input sm:col-span-2" placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <button className="btn btn-primary sm:col-span-2" disabled={saving}><UserPlus size={16} /> {saving ? 'Creating patient...' : 'Create patient account'}</button>
        </form>
        {notice && <p className="text-sm text-primary mt-3">{notice}</p>}
      </Card>
      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : patients.length === 0 ? (
        <Card className="p-10 text-center"><p className="text-muted text-sm">No registered patients yet.</p></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-secondary/30 flex items-center justify-center font-heading font-semibold text-primary-dark">
                  {p.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <p className="font-medium">{p.name}</p>
              </div>
              <p className="text-xs text-muted flex items-center gap-1.5"><Mail size={12} /> {p.email}</p>
              {p.phone && <p className="text-xs text-muted flex items-center gap-1.5 mt-1"><Phone size={12} /> {p.phone}</p>}
              <p className="text-xs text-primary mt-2">Patient ID: {p.patientId || '—'} · Age: {p.age || '—'}</p>
              <button type="button" onClick={() => removePatient(p)} className="btn btn-outline !mt-3 !py-1.5 !px-2.5 !text-xs text-red-700"><Trash2 size={13} /> Remove patient</button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
