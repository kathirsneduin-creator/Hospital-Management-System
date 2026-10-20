import { AtSign, Phone, Mail as MailIcon, MapPin } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import ContactForm from '../components/ui/ContactForm';
import ContactInfoCard from '../components/ui/ContactInfoCard';

const bubbles = [AtSign, Phone, MailIcon, MapPin];

export default function Contact() {
  return (
    <div>
      <section className="relative bg-gradient-to-r from-[#EAF6EA] to-[#F3FAF3] overflow-hidden">
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-6 py-14">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-dark">Contact Us</h1>
          </div>
          <div className="flex gap-4">
            {bubbles.map((Icon, i) => (
              <div key={i} className="w-16 h-16 rounded-full bg-[#C9A876]/30 flex items-center justify-center">
                <Icon className="text-primary-dark" size={24} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-app grid lg:grid-cols-3 gap-6">
          <ContactForm />
          <ContactInfoCard />
        </div>
      </section>
    </div>
  );
}
