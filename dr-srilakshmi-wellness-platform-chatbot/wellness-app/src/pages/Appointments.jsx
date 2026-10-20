import { CalendarCheck } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import ConsultationChatbot from '../components/booking/ConsultationChatbot';

export default function Appointments() {
  return (
    <div>
      <PageHero
        title="Book an Appointment"
        subtitle="Chat with our booking assistant — pick your doctor, date and time in a few taps."
        icon={CalendarCheck}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Appointments' }]}
        image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop"
      />

      <section className="py-14">
        <div className="container-app max-w-2xl">
          <div className="rounded-2xl shadow-2xl overflow-hidden border border-secondary/20">
            <ConsultationChatbot embedded />
          </div>
        </div>
      </section>
    </div>
  );
}
