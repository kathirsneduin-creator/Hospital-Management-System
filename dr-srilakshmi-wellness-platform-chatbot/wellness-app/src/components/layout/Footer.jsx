import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { publicCatalog, publicText } from '../../data/translations';

const quickLinks = [
  { href: '/#home', label: 'Home' },
  { href: '/#programs', label: 'Programs' },
  { href: '/#live-sessions', label: 'Live Session' },
  { href: '/#nutrition', label: 'Nutrition' },
  { href: '/#about', label: 'About Us' },
  { href: '/#contact', label: 'Contact' },
];

const services = [
  'Homeopathy',
  'Medical Yoga',
  'Clinical Nutrition',
  'Breathing Therapy',
  'Lifestyle Programs',
  'Online Consultation',
];

export default function Footer() {
  const { language } = useAuth();
  const text = publicText[language];
  const catalog = publicCatalog[language];
  const labels = [text.home, text.programs, text.liveSessions, text.nutrition, text.about, text.contact];
  return (
    <footer className="bg-primary-dark text-white">
      <div className="container-app py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.png" alt="" className="h-11 w-11 object-contain bg-white rounded-full p-1 img-stroke" />
            <div className="leading-tight">
              <p className="font-heading font-bold text-lg">DR. SRILAKSHMI</p>
              <p className="font-heading text-xs tracking-widest text-secondary-light">HOMEO &amp; YOGA CLINIC</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">AI-Powered Smart Digital Wellness Platform</p>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/80">
            {quickLinks.map((l, index) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-secondary-light transition-colors">{labels[index]}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">{text.ourServices}</h4>
          <ul className="space-y-2 text-sm text-white/80">
            {services.map((s) => (
              <li key={s}>{catalog.services[s] || s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4">{text.connect}</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary-dark transition-colors"><Facebook size={16} /></a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary-dark transition-colors"><Instagram size={16} /></a>
            <a href="https://wa.me/919443629722" aria-label="WhatsApp" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary-dark transition-colors"><MessageCircle size={16} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Dr. Srilakshmi Homeo &amp; Yoga Clinic. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">{text.privacy}</Link>
            <Link to="/terms" className="hover:text-white">{text.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
