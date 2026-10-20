import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { programs } from '../../../data/content';
import { subscribeAppointments } from '../../../lib/appointmentService';

export default function AdminAnalytics() {
  const [appointments, setAppointments] = useState([]);
  useEffect(() => subscribeAppointments(setAppointments), []);

  const byProgram = programs.map((p) => ({
    title: p.title,
    count: appointments.filter((a) => a.program === p.title || a.healthConcern === p.title).length,
  })).sort((a, b) => b.count - a.count);

  const max = Math.max(1, ...byProgram.map((p) => p.count));

  const byStatus = ['pending', 'confirmed', 'completed', 'cancelled'].map((s) => ({
    status: s,
    count: appointments.filter((a) => a.status === s).length,
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-heading font-semibold text-primary-dark mb-5 flex items-center gap-2">
          <BarChart3 size={18} /> Bookings by Program
        </h3>
        <div className="space-y-3">
          {byProgram.slice(0, 8).map((p) => (
            <div key={p.title}>
              <div className="flex justify-between text-xs mb-1">
                <span>{p.title}</span>
                <span className="text-muted">{p.count}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/15">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(p.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-heading font-semibold text-primary-dark mb-5">Appointment Status Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          {byStatus.map((s) => (
            <div key={s.status} className="rounded-xl bg-secondary/10 p-4 text-center">
              <p className="font-heading font-bold text-2xl text-primary-dark">{s.count}</p>
              <p className="text-xs text-muted capitalize mt-1">{s.status}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
