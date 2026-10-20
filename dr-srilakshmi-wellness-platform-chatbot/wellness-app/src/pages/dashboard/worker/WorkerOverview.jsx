import { ClipboardList, Video, Users } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { liveSessions } from '../../../data/content';

const tasks = [
  { title: 'Prep consultation rooms', detail: 'Sanitize and keep case files ready before 9:00 AM' },
  { title: 'Support live session', detail: liveSessions.today.title },
  { title: 'Patient flow', detail: 'Guide patients from reception to the assigned doctor cabin' },
];

export default function WorkerOverview() {
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-primary-dark flex items-center gap-2">
        <ClipboardList size={20} /> Floor tasks
      </h2>
      <p className="text-sm text-muted">Workers support sessions and clinic operations. Admin can promote this role to receptionist or doctor.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {tasks.map((t) => (
          <Card key={t.title} className="p-5">
            <p className="font-heading font-semibold text-primary-dark">{t.title}</p>
            <p className="text-sm text-muted mt-2">{t.detail}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6 flex items-start gap-3">
        <Video className="text-primary mt-1" />
        <div>
          <p className="font-medium">Today's wellness session</p>
          <p className="text-sm text-muted mt-1">{liveSessions.today.date} · {liveSessions.today.time}</p>
        </div>
      </Card>
      <Card className="p-6 flex items-start gap-3">
        <Users className="text-primary mt-1" />
        <div>
          <p className="font-medium">Need a promotion?</p>
          <p className="text-sm text-muted mt-1">Ask an admin to change your role under Staff & Users.</p>
        </div>
      </Card>
    </div>
  );
}
