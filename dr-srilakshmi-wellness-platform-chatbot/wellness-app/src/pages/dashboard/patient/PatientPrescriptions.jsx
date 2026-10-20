import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import { subscribePrescriptions } from '../../../lib/appointmentService';
import { patientText } from '../../../data/translations';

export default function PatientPrescriptions() {
  const { currentUser, userProfile, language } = useAuth();
  const text = patientText[language];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return undefined;
    return subscribePrescriptions((prescriptions) => {
      setItems(prescriptions.filter((item) => item.patientId === currentUser.uid || item.patientId === userProfile?.patientId || item.patientPhone === userProfile?.phone));
      setLoading(false);
    });
  }, [currentUser, userProfile]);

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-primary-dark mb-6">{text.digitalPrescriptions}</h2>
      {loading ? (
        <p className="text-sm text-muted">{text.loading}</p>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center"><p className="text-muted text-sm">{text.noPrescriptions}</p></Card>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <Card key={p.id} className="p-5 flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                  <FileText className="text-primary" size={20} />
                </div>
                <div className="w-full">
                  <p className="font-heading font-semibold text-primary-dark">Prescription / Bill</p>
                  <p className="text-sm mt-2">Patient: {p.patientName || '—'} · ID: {p.patientId} · Age: {p.patientAge || '—'}</p>
                  <p className="text-xs text-muted mt-1">Doctor: {p.doctorName || 'Dr. Srilakshmi'} · Consultation: {p.consultationDate || '—'}</p>
                  <div className="my-3 border-y border-primary/10 py-2 text-sm">{(p.items || [{ medicine: p.medicine, quantity: '', dosage: p.dosage }]).map((item, index) => <p key={index}>{index + 1}. {item.medicine} {item.quantity && `· Qty ${item.quantity}`} {item.dosage && `· ${item.dosage}`} {item.instructions && `· ${item.instructions}`}</p>)}</div>
                  <p className="text-sm text-muted">Booking: {p.appointmentDetails ? `${p.appointmentDetails.date || p.consultationDate || '—'} at ${p.appointmentDetails.time || '—'} · ${p.appointmentDetails.consultationType || 'consultation'}` : 'Consultation details unavailable'}</p>
                </div>
              </div>
              {p.fileUrl && (
                <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline !text-xs shrink-0">
                  <Download size={14} /> {text.view}
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
