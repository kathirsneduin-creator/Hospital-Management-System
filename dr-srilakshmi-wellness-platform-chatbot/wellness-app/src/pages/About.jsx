import { Target, Flower2, UserCircle2, Sparkles, HeartHandshake, Leaf, ShieldCheck, Star } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import ContactForm from '../components/ui/ContactForm';
import ContactInfoCard from '../components/ui/ContactInfoCard';

const values = [
  { icon: Target, title: 'Our Mission', desc: 'To empower individuals with safe and effective natural therapies for long-term wellness.' },
  { icon: Flower2, title: 'Our Vision', desc: 'To be a trusted name in natural healing and holistic healthcare.' },
  { icon: UserCircle2, title: 'Our Values', desc: 'Compassion, Integrity, Excellence & Holistic Care.' },
];

const whyChoose = [
  { icon: Sparkles, label: 'Holistic Healing' },
  { icon: HeartHandshake, label: 'Personalized Care' },
  { icon: Leaf, label: 'Natural & Safe' },
  { icon: Star, label: 'Lasting Wellness' },
];

export default function About() {
  return (
    <div>
      <PageHero
        title="About Dr. Srilakshmi"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About Us' }]}
        image="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop"
      />

      <section className="py-16">
        <div className="container-app grid lg:grid-cols-[0.9fr_1.4fr] gap-6">
          <div className="card-outline p-7">
            <h3 className="font-heading text-2xl font-bold text-primary-dark">Dr. J. Srilakshmi</h3>
            <p className="text-sm font-medium text-muted mt-2">BHMS, MD (Homoeo)<br />PGDNC, (Clinical Nutrition)</p>
            <p className="text-sm text-muted mt-4">
              Dedicated to helping you achieve optimal health through holistic healing using natural therapies.
            </p>
            <a href="#approach" className="btn btn-primary mt-6">Know More</a>
          </div>

          <div className="bg-secondary/10 rounded-2xl p-7 grid sm:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title}>
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-3">
                  <v.icon className="text-primary" size={20} />
                </div>
                <p className="font-heading font-semibold text-sm text-primary-dark">{v.title}</p>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 pb-16">
        <div className="container-app grid lg:grid-cols-3 gap-6">
          <ContactForm />
          <ContactInfoCard />
        </div>
      </section>

      <section id="approach" className="py-16 bg-white">
        <div className="container-app grid md:grid-cols-2 gap-6">
          <div className="bg-secondary/10 rounded-2xl p-7">
            <h3 className="font-heading font-semibold text-lg text-primary-dark">Why Choose Us?</h3>
            <p className="text-sm text-muted mt-2">
              We combine the healing power of Homeopathy with the strength of Yoga and Nutrition to create
              personalized care that brings lasting health and balance to your life.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {whyChoose.map((w) => (
                <div key={w.label} className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <w.icon className="text-primary" size={18} />
                  </div>
                  <p className="text-xs font-medium">{w.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-secondary/10 rounded-2xl p-7 flex flex-col justify-center">
            <h3 className="font-heading font-semibold text-lg text-primary-dark">Our Approach</h3>
            <p className="text-sm text-muted mt-2">
              At Dr. Srilakshmi Homeo &amp; Yoga Clinic, we believe true healing comes from understanding your
              body, mind, and lifestyle. Our integrated approach helps you achieve better health naturally and
              sustainably.
            </p>
            <a href="/programs" className="btn btn-primary mt-5 self-start">
              <ShieldCheck size={16} /> Learn More About Our Approach
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
