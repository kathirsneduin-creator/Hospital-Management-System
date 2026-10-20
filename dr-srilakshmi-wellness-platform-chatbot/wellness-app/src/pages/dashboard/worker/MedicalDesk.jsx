import { useEffect, useMemo, useState } from 'react';
import { FileSearch, CheckCircle2, Clock3 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { subscribePrescriptions, markPrescriptionReceived, subscribeNutritionRequests } from '../../../lib/appointmentService';

export default function MedicalDesk() {
  const [items, setItems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => subscribePrescriptions(setItems), []);
  useEffect(() => subscribeNutritionRequests(setPlans), []);

  const results = useMemo(() => items.filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) return item.consultationDate === today || item.createdAt === today;
    return String(item.patientId || '').toLowerCase().includes(query) || String(item.patientName || '').toLowerCase().includes(query);
  }), [items, search, today]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary-dark flex items-center gap-2"><FileSearch size={20} /> Medical Desk</h2>
        <p className="text-sm text-muted mt-1">Search a patient ID to view today&apos;s prescription summary and confirm medicines received.</p>
      </div>
      <Card className="p-5">
        <label className="text-sm font-medium block mb-1.5" htmlFor="patient-search">Patient ID or name</label>
        <input id="patient-search" className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Enter 4-digit patient ID" inputMode="numeric" />
      </Card>
      {results.length === 0 ? <Card className="p-8 text-center text-sm text-muted">No prescription summary found for this search.</Card> : (
        <div className="space-y-3">
          {results.map((item) => <Card key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-primary-dark">{item.patientName || 'Patient'} <span className="text-xs font-normal text-muted">ID: {item.patientId}</span></p>
              <p className="text-sm mt-1">{item.medicine}</p>
              <p className="text-xs text-muted mt-1">{item.dosage || 'Follow doctor instructions'} · {item.doctorName}</p>
              <p className="text-xs text-muted mt-1 flex items-center gap-1"><Clock3 size={12} /> Consultation: {item.consultationDate || today}</p>
            </div>
            <button type="button" disabled={item.tabletsReceived} onClick={() => markPrescriptionReceived(item.id)} className={`btn ${item.tabletsReceived ? 'btn-secondary' : 'btn-primary'} shrink-0`}><CheckCircle2 size={15} /> {item.tabletsReceived ? 'Tablets received' : 'Confirm tablets received'}</button>
          </Card>)}
        </div>
      )}
      <Card className="p-5"><h3 className="font-heading font-semibold text-primary-dark mb-3">Active nutrition plans</h3>{plans.filter((plan) => plan.status === 'active').length === 0 ? <p className="text-sm text-muted">No active plans.</p> : <div className="space-y-2">{plans.filter((plan) => plan.status === 'active').map((plan) => <div key={plan.id} className="rounded-lg border border-primary/15 px-3 py-2"><p className="text-sm font-medium">{plan.patientName} · ID {plan.patientId}</p><p className="text-xs text-muted">{plan.planName} · {plan.consultationType}</p></div>)}</div>}</Card>
    </div>
  );
}
