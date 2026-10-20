import { Phone, Mail, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { publicText } from '../../data/translations';

export default function TopBar() {
  const { language } = useAuth();
  const text = publicText[language];
  return (
    <div className="hidden md:block bg-primary-dark text-white/90 text-xs">
      <div className="container-app flex items-center justify-between py-2">
        <div className="flex items-center gap-6">
          <a href="tel:+919443629722" className="flex items-center gap-1.5 hover:text-white">
            <Phone size={13} /> 94436 29722
          </a>
          <a href="mailto:info@drsrilakshmihomeo.com" className="flex items-center gap-1.5 hover:text-white">
            <Mail size={13} /> info@drsrilakshmihomeo.com
          </a>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {language === 'ta' ? 'திங்கள் - சனி: காலை 9.00 - மதியம் 1.00 | மாலை 6.00 - 8.00' : 'Mon - Sat: 9.00 AM - 1.00 PM | 6.00 PM - 8.00 PM'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{language === 'ta' ? 'எங்களைப் பின்தொடர்க:' : 'Follow Us:'}</span>
          <a href="#" aria-label="Facebook" className="hover:text-secondary-light"><Facebook size={14} /></a>
          <a href="#" aria-label="Instagram" className="hover:text-secondary-light"><Instagram size={14} /></a>
          <a href="#" aria-label="YouTube" className="hover:text-secondary-light"><Youtube size={14} /></a>
        </div>
      </div>
    </div>
  );
}
