import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { publicText } from '../../data/translations';

export default function ContactInfoCard() {
  const { language } = useAuth();
  const text = publicText[language];
  return (
    <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
      <div className="card-outline p-7">
        <h3 className="font-heading font-semibold text-lg text-primary-dark mb-5">{text.contactInfo}</h3>
        <ul className="space-y-4 text-sm">
          <li className="flex gap-3">
            <MapPin className="text-primary shrink-0" size={18} />
            <span>18, Thayumanavar Street,<br />Anna, Tamil Nadu - 626002</span>
          </li>
          <li className="flex gap-3">
            <Phone className="text-primary shrink-0" size={18} />
            <span>+91 84842 38722<br />+91 04362 238332</span>
          </li>
          <li className="flex gap-3">
            <Mail className="text-primary shrink-0" size={18} />
            <a href="mailto:info@drsrilakshmihomeo.com" className="hover:text-primary">info@drsrilakshmihomeo.com</a>
          </li>
          <li className="flex gap-3">
            <Clock className="text-primary shrink-0" size={18} />
            <span>{language === 'ta' ? 'திங்கள் - சனி: காலை 9.00 - மதியம் 1.00' : 'Mon - Sat: 9.00 AM - 1.00 PM'}<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{language === 'ta' ? 'மாலை 5.00 - 8.00' : '5.00 PM - 8.00 PM'}</span>
          </li>
          <li className="flex gap-3 text-muted">
            <span className="w-[18px] shrink-0" /> {language === 'ta' ? 'ஞாயிறு: மூடப்பட்டது' : 'Sunday: Closed'}
          </li>
        </ul>
      </div>

      <div className="card-outline p-7 flex flex-col">
        <h3 className="font-heading font-semibold text-lg text-primary-dark mb-5">{text.findUs}</h3>
        <div className="rounded-xl overflow-hidden flex-1 min-h-[220px]">
          <iframe
            title="Clinic location"
            className="w-full h-full min-h-[220px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Anna,Tamil+Nadu+626002&output=embed"
          />
        </div>
        <a
          href="https://www.google.com/maps/search/?api=1&query=18+Thayumanavar+Street+Anna+Tamil+Nadu+626002"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-4 self-start"
        >
          <Navigation size={16} /> {text.directions}
        </a>
      </div>
    </div>
  );
}
