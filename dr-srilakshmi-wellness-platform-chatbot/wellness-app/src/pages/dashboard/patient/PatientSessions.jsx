import { Video, Calendar, Clock3, PlayCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { liveSessions } from '../../../data/content';
import { patientText } from '../../../data/translations';
import { useAuth } from '../../../context/AuthContext';

export default function PatientSessions() {
  const { language } = useAuth();
  const text = patientText[language];
  const titles = language === 'ta' ? {
    'Breathing for Better Health': 'சிறந்த உடல்நலத்திற்கான சுவாசம்', 'Yoga for Stress Relief': 'மனஅழுத்த நிவாரண யோகா', 'Immunity Boost Naturally': 'இயற்கையான நோய் எதிர்ப்பு சக்தி', 'Healthy Weight Management': 'ஆரோக்கியமான எடை மேலாண்மை', 'Benefits of Surya Namaskar': 'சூரிய நமஸ்காரத்தின் பயன்கள்', 'Pranayama for Beginners': 'தொடக்கநிலைக்கான பிராணாயாமம்', 'Detox Your Body Naturally': 'உடலை இயற்கையாக சுத்திகரித்தல்'
  } : {};
  return (
    <div className="space-y-8">
      <Card className="p-6 bg-secondary/10 !shadow-none">
        <p className="text-sm text-muted">{text.todaysSession}</p>
        <h3 className="font-heading text-xl font-bold text-primary-dark mt-1">{titles[liveSessions.today.title] || liveSessions.today.title}</h3>
        <p className="text-sm text-muted mt-1">With {liveSessions.today.with}</p>
        <div className="flex gap-4 mt-3 text-sm text-ink/80">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {liveSessions.today.date}</span>
          <span className="flex items-center gap-1.5"><Clock3 size={14} /> {liveSessions.today.time}</span>
        </div>
        <a
          href="https://meet.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-5"
        >
          <Video size={16} /> {text.joinMeet}
        </a>
      </Card>

      <div>
        <h3 className="font-heading font-semibold text-primary-dark mb-4">{text.upcomingSessions}</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {liveSessions.upcoming.map((s) => (
            <Card key={s.title} className="overflow-hidden">
              <img src={s.image} alt="" className="w-full h-28 object-cover" />
              <div className="p-4">
                <p className="font-medium text-sm">{titles[s.title] || s.title}</p>
                <p className="text-xs text-muted mt-1">{s.date} · {s.time}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-primary-dark mb-4">{text.recordings}</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {liveSessions.previous.map((s) => (
            <Card key={s.title} className="overflow-hidden">
              <div className="relative">
                <img src={s.image} alt="" className="w-full h-28 object-cover" />
                <button className="absolute inset-0 bg-black/20 flex items-center justify-center text-white hover:bg-black/30 transition-colors">
                  <PlayCircle size={32} />
                </button>
              </div>
              <div className="p-4">
                <p className="font-medium text-sm">{titles[s.title] || s.title}</p>
                <p className="text-xs text-muted mt-1">{s.date}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
