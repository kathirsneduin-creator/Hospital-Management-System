import { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { subscribeInvoices } from '../../../lib/appointmentService';

export default function MedicalInvoices() {
  const [invoices, setInvoices] = useState([]);
  useEffect(() => subscribeInvoices(setInvoices), []);
  return <div><h2 className="font-heading text-xl font-bold text-primary-dark mb-6 flex items-center gap-2"><Receipt size={20} /> Recent Invoices</h2>{invoices.length === 0 ? <Card className="p-10 text-center text-sm text-muted">No invoices generated yet.</Card> : <div className="space-y-4">{invoices.map((invoice) => <Card key={invoice.id} className="p-5"><div className="flex justify-between gap-3"><div><p className="font-heading font-semibold text-primary-dark">Invoice {invoice.id}</p><p className="text-sm mt-1">{invoice.patientName || 'Patient'} · Patient ID {invoice.patientId} · Age {invoice.patientAge || '—'}</p><p className="text-xs text-muted mt-1">Doctor: {invoice.doctorName || '—'} · Booking: {invoice.appointmentDetails?.date || invoice.consultationDate || '—'} at {invoice.appointmentDetails?.time || '—'}</p></div><span className="text-xs text-primary">Generated</span></div><div className="my-3 border-y border-primary/10 py-2 text-sm">{invoice.items.map((item, index) => <p key={index}>{index + 1}. {item.medicine} {item.quantity && `· Qty ${item.quantity}`} {item.dosage && `· ${item.dosage}`} {item.instructions && `· ${item.instructions}`}</p>)}</div></Card>)}</div>}</div>;
}
