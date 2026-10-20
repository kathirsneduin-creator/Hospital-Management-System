import { useState } from 'react';
import { Video, Plus, Calendar } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { liveSessions } from '../../../data/content';

export default function DoctorContent() {
  const [sessions, setSessions] = useState(liveSessions.upcoming);
  const [form, setForm] = useState({ title: '', date: '', time: '', link: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    // TODO: persist to Firestore `sessions` collection in production.
    setSessions([{ title: form.title, with: 'Dr. J. Srilakshmi', date: form.date, time: form.time, image: liveSessions.today.image }, ...sessions]);
    setForm({ title: '', date: '', time: '', link: '' });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
      <Card className="p-6 h-fit">
        <h3 className="font-heading font-semibold text-primary-dark mb-4 flex items-center gap-2">
          <Video size={18} /> Schedule Live Session
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Session Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Pranayama for Beginners" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Date</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Time</label>
              <input className="input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Google Meet Link</label>
            <input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://meet.google.com/xxx-xxxx-xxx" />
          </div>
          <button className="btn btn-primary w-full">
            <Plus size={16} /> Schedule Session
          </button>
        </form>
      </Card>

      <div>
        <h3 className="font-heading font-semibold text-primary-dark mb-4">Scheduled Sessions</h3>
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <Card key={i} className="p-4 flex items-center gap-3">
              <img src={s.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5"><Calendar size={11} /> {s.date} · {s.time}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
