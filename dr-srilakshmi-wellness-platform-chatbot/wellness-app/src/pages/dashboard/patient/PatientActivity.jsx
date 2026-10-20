import { useEffect, useState } from 'react';
import { Activity, CalendarCheck, FileText, MessageCircle, Salad, UserPlus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { getActivities, subscribeLocal } from '../../../lib/localDb';
import { patientText } from '../../../data/translations';

const icons = { booking: CalendarCheck, prescription: FileText, nutrition: Salad, notification: MessageCircle, account: UserPlus };

export default function PatientActivity() {
  const { currentUser, userProfile, language } = useAuth();
  const [items, setItems] = useState([]);
  const text = patientText[language];
  const translateActivity = (item) => {
    if (language !== 'ta') return { title: item.title, detail: item.detail };
    const title = { 'Patient account created': 'நோயாளர் கணக்கு உருவாக்கப்பட்டது', 'Password changed': 'கடவுச்சொல் மாற்றப்பட்டது', 'Mobile number added': 'மொபைல் எண் சேர்க்கப்பட்டது', 'Family member added': 'குடும்ப உறுப்பினர் சேர்க்கப்பட்டார்', 'Consultation booked': 'ஆலோசனை முன்பதிவு செய்யப்பட்டது', 'Prescription issued': 'மருந்துச் சீட்டு வழங்கப்பட்டது', 'Nutrition plan requested': 'ஊட்டச்சத்து திட்டம் கோரப்பட்டது' };
    const detail = item.detail
      .replace('Patient ID:', 'நோயாளர் அடையாள எண்:')
      .replace('Username:', 'பயனர் பெயர்:')
      .replace('Initial password:', 'தொடக்க கடவுச்சொல்:')
      .replace('Your patient account password was updated.', 'உங்கள் நோயாளர் கணக்கு கடவுச்சொல் புதுப்பிக்கப்பட்டது.')
      .replace('New login mobile:', 'புதிய உள்நுழைவு மொபைல் எண்:')
      .replace('Doctor', 'மருத்துவர்')
      .replace('consultation', 'ஆலோசனை');
    return { title: title[item.title] || item.title.replace('Appointment ', 'சந்திப்பு ').replace('Nutrition plan ', 'ஊட்டச்சத்து திட்டம் '), detail };
  };
  useEffect(() => subscribeLocal(() => {
    const patientId = userProfile?.patientId || currentUser?.patientId || currentUser?.uid;
    setItems(getActivities().filter((item) => item.patientId === patientId || item.phone === userProfile?.phone));
  }), [currentUser, userProfile]);

  return <div>
    <h2 className="font-heading text-xl font-bold text-primary-dark mb-2 flex items-center gap-2"><Activity size={20} /> {text.activityTitle}</h2>
    <p className="text-sm text-muted mb-6">{text.activitySubtitle}</p>
    {items.length === 0 ? <Card className="p-10 text-center text-sm text-muted">{text.noActivity}</Card> : <div className="space-y-3">{items.map((item) => { const Icon = icons[item.type] || Activity; const translated = translateActivity(item); return <Card key={item.id} className="p-4 flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0"><Icon size={18} className="text-primary" /></div><div><p className="text-sm font-semibold text-primary-dark">{translated.title}</p><p className="text-sm text-ink mt-0.5">{translated.detail}</p><p className="text-xs text-muted mt-1">{new Date(item.createdAt).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN')}</p></div></Card>; })}</div>}
  </div>;
}