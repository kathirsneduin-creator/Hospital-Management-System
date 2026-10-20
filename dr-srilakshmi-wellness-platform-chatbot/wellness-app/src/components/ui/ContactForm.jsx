import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { publicText } from '../../data/translations';

const TOPICS = ['Appointment help', 'Programs', 'Nutrition plan', 'Live session', 'Other'];
const TIMES = ['Morning (9–1)', 'Evening (5–8)', 'Call me anytime'];

export default function ContactForm() {
  const { language } = useAuth();
  const text = publicText[language];
  const [form, setForm] = useState({ name: '', phone: '', address: '', topic: TOPICS[0], time: TIMES[0] });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', phone: '', address: '', topic: TOPICS[0], time: TIMES[0] });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="lg:col-span-1 card-outline p-7">
      <h3 className="font-heading font-semibold text-lg text-primary-dark mb-5">{text.getInTouch}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" name="name" placeholder={text.yourName} required value={form.name} onChange={handleChange} />
        <input className="input" name="phone" placeholder={text.mobileNumber} required value={form.phone} onChange={handleChange} />
        <textarea className="input min-h-[80px]" name="address" placeholder={text.address} required value={form.address} onChange={handleChange} />
        <select className="input" name="topic" value={form.topic} onChange={handleChange}>
          {TOPICS.map((t) => <option key={t}>{language === 'ta' ? ({ 'Appointment help': text.appointmentHelp, Programs: text.programs, 'Nutrition plan': text.nutrition, 'Live session': text.liveSessions, Other: text.other }[t] || t) : t}</option>)}
        </select>
        <select className="input" name="time" value={form.time} onChange={handleChange}>
          {TIMES.map((t) => <option key={t}>{language === 'ta' ? ({ 'Morning (9–1)': text.morning, 'Evening (5–8)': text.evening, 'Call me anytime': text.anytime }[t] || t) : t}</option>)}
        </select>
        <button className="btn btn-primary w-full">
          <Send size={16} /> {text.send}
        </button>
        {sent && <p className="text-sm text-primary text-center">{text.thankYou}</p>}
      </form>
    </div>
  );
}
