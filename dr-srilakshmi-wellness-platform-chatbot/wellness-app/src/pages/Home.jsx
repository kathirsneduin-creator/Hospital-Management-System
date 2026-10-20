import { Link } from 'react-router-dom';
import {
  CalendarCheck, Video, Users, Award, Heart, Leaf, PersonStanding, Apple, Wind, Video as VideoIcon,
  ShieldCheck, UserCheck, HeartHandshake, Sparkles as SparklesIcon, Globe2, Check, Salad,
  UserCheck as UserCheckIcon, TrendingUp, Trophy, Lock, PlayCircle, MessageSquareText, Clock3, Calendar,
  Target, Flower2, UserCircle2, Star, AtSign, Phone, Mail as MailIcon, MapPin, Bot,
} from 'lucide-react';
import { programs, services, nutritionPlans, liveSessions } from '../data/content';
import ContactForm from '../components/ui/ContactForm';
import ContactInfoCard from '../components/ui/ContactInfoCard';
import { useAuth } from '../context/AuthContext';
import { publicCatalog, publicText } from '../data/translations';

const iconMap = { Leaf, PersonStanding, Apple, Wind, Users, Video: VideoIcon };

const stats = [
  { icon: Users, value: '5000+', label: 'Happy Patients' },
  { icon: Award, value: '10+', label: 'Years Experience' },
  { icon: Video, value: '100+', label: 'Live Sessions' },
  { icon: Heart, value: '95%', label: 'Patient Satisfaction' },
];

const whyChooseUs = [
  { icon: ShieldCheck, title: 'Natural & Safe', desc: 'Treatments' },
  { icon: UserCheck, title: 'Expert & Experienced', desc: 'Doctor' },
  { icon: HeartHandshake, title: 'Personalized', desc: 'Care' },
  { icon: SparklesIcon, title: 'Holistic & Long Term', desc: 'Wellness' },
  { icon: Globe2, title: 'Online & Offline', desc: 'Support' },
];

const values = [
  { icon: Target, title: 'Our Mission', desc: 'To empower individuals with safe and effective natural therapies for long-term wellness.' },
  { icon: Flower2, title: 'Our Vision', desc: 'To be a trusted name in natural healing and holistic healthcare.' },
  { icon: UserCircle2, title: 'Our Values', desc: 'Compassion, Integrity, Excellence & Holistic Care.' },
];

const perks = [
  { icon: Salad, title: 'Personalized Diet', desc: 'Tailored to your body & goals' },
  { icon: UserCheckIcon, title: 'Expert Guidance', desc: 'By nutritionist' },
  { icon: TrendingUp, title: 'Track & Improve', desc: 'Your progress' },
  { icon: Trophy, title: 'Get Results', desc: 'With consistency' },
];

const bubbles = [AtSign, Phone, MailIcon, MapPin];

export default function Home() {
  const { language } = useAuth();
  const text = publicText[language];
  const catalog = publicCatalog[language];
  const copy = (english, tamil) => language === 'ta' ? tamil : english;
  const sessionTitle = language === 'ta' ? 'சிறந்த உடல்நலத்திற்கான சுவாசம்' : liveSessions.today.title;
  const sessionWith = language === 'ta' ? 'டாக்டர் ஜெ. ஸ்ரீலட்சுமி' : liveSessions.today.with;
  const statLabels = language === 'ta' ? ['மகிழ்ச்சியான நோயாளிகள்', 'ஆண்டுகள் அனுபவம்', 'நேரலை அமர்வுகள்', 'நோயாளர் திருப்தி'] : stats.map((stat) => stat.label);
  const featureText = language === 'ta' ? {
    'Personalized Diet Plan': 'தனிப்பயன் உணவுத் திட்டம்', 'Weekly Meal Plan': 'வாராந்திர உணவுத் திட்டம்', 'Super Food Guide': 'சிறந்த உணவு வழிகாட்டி', 'Goal Based Nutrition': 'இலக்கு அடிப்படையிலான ஊட்டச்சத்து', '1 Consultation / Month': 'மாதத்திற்கு 1 ஆலோசனை', 'Workout Based Nutrition': 'உடற்பயிற்சி அடிப்படையிலான ஊட்டச்சத்து', '2 Consultations / Month': 'மாதத்திற்கு 2 ஆலோசனைகள்', 'Progress Tracking': 'முன்னேற்றக் கண்காணிப்பு', 'Unlimited Consultations': 'வரம்பற்ற ஆலோசனைகள்', 'Priority Coaching': 'முன்னுரிமை வழிகாட்டுதல்'
  } : {};
  const valueText = language === 'ta' ? {
    'Our Mission': 'எங்கள் நோக்கம்', 'Our Vision': 'எங்கள் பார்வை', 'Our Values': 'எங்கள் மதிப்புகள்', 'Natural & Safe': 'இயற்கை மற்றும் பாதுகாப்பானது', 'Expert & Experienced': 'நிபுணத்துவம் மற்றும் அனுபவம்', Personalized: 'தனிப்பயன் பராமரிப்பு', 'Holistic & Long Term': 'முழுமையான நீண்டகால நலவாழ்வு', 'Online & Offline': 'ஆன்லைன் மற்றும் நேரடி ஆதரவு', 'Treatments': 'சிகிச்சைகள்', Doctor: 'மருத்துவர்', Care: 'பராமரிப்பு', Wellness: 'நலவாழ்வு', Support: 'ஆதரவு', 'To empower individuals with safe and effective natural therapies for long-term wellness.': 'நீண்டகால நலவாழ்வுக்கான பாதுகாப்பான மற்றும் பயனுள்ள இயற்கை சிகிச்சைகளால் தனிநபர்களை வலுப்படுத்துதல்.', 'To be a trusted name in natural healing and holistic healthcare.': 'இயற்கை சிகிச்சை மற்றும் முழுமையான சுகாதாரத்தில் நம்பகமான பெயராக இருப்பது.', 'Compassion, Integrity, Excellence & Holistic Care.': 'அன்பு, நேர்மை, சிறப்பு மற்றும் முழுமையான பராமரிப்பு.'
  } : {};
  const benefitText = language === 'ta' ? { 'Personalized Diet': 'தனிப்பயன் உணவு', 'Expert Guidance': 'நிபுணர் வழிகாட்டுதல்', 'Track & Improve': 'கண்காணித்து மேம்படுத்துங்கள்', 'Get Results': 'முடிவுகளைப் பெறுங்கள்', 'Tailored to your body & goals': 'உங்கள் உடல் மற்றும் இலக்குகளுக்கேற்றது', 'By nutritionist': 'ஊட்டச்சத்து நிபுணரால்', 'Your progress': 'உங்கள் முன்னேற்றம்', 'With consistency': 'தொடர்ச்சியுடன்' } : {};
  return (
    <div>
      <section id="home" className="landing-band relative overflow-hidden scroll-mt-28">
        <div className="container-app grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-16 lg:py-24">
          <div className="animate-fadeInUp">
            <p className="section-eyebrow text-sm mb-3">{text.eyebrow}</p>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-dark leading-[1.02] max-w-xl">
              {text.heroTitle}
            </h1>
            <p className="mt-5 text-lg font-medium text-ink/80 max-w-lg">
              {text.heroLead}
            </p>
            <p className="mt-3 text-muted max-w-md leading-relaxed">
              {text.heroDetail}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#book" className="btn btn-primary">
                <CalendarCheck size={18} /> {text.bookConsultation}
              </a>
              <a href="#live-sessions" className="btn btn-outline">
                <Video size={18} /> {text.joinSession}
              </a>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-secondary/30 rounded-full blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=900&auto=format&fit=crop"
              alt="Dr. Srilakshmi, homeopathy and yoga physician"
              className="relative rounded-[2rem] w-full max-w-md object-cover shadow-2xl aspect-[4/5] img-stroke"
            />
          </div>
        </div>
        <div className="container-app pb-14">
          <div className="card-glass grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-7 shadow-glass border-2 border-primary/20">
            {stats.map((s, index) => (
              <div key={s.label} className="flex items-center gap-3 justify-center md:justify-start">
                <s.icon className="text-primary" size={28} />
                <div>
                  <p className="font-heading font-bold text-2xl text-primary-dark leading-none">{s.value}</p>
                  <p className="text-xs text-muted mt-1">{statLabels[index]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-bg">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-dark">{text.services}</h2>
            <p className="text-muted mt-2">{text.servicesLead}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const Icon = iconMap[s.icon] || Leaf;
              return (
                <div key={s.title} className="card-outline card-hover p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary/20 flex items-center justify-center mb-4">
                    <Icon className="text-primary" size={26} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg">{catalog.services[s.title] || s.title}</h3>
                  <p className="text-sm text-muted mt-2">{catalog.serviceDesc[s.title] || s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="programs" className="py-16 bg-white scroll-mt-28">
        <div className="container-app">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-dark">{text.programsTitle}</h2>
            <p className="text-muted mt-2">{text.programsLead}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {programs.map((p) => (
              <div key={p.slug} className="card card-hover overflow-hidden border-2 border-primary/20">
                <img src={p.image} alt={p.title} className="w-full h-28 object-cover img-stroke !rounded-none !border-x-0 !border-t-0" />
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-sm">{catalog.programs[p.title] || p.title}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{catalog.programShort[p.short] || p.short}</p>
                  <a href="#book" className="btn btn-outline w-full mt-3 !py-2 !text-xs">{text.bookForThis}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="live-sessions" className="py-16 bg-bg scroll-mt-28">
        <div className="container-app">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-dark">{text.liveTitle}</h2>
            <p className="text-muted mt-2">{text.liveLead}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-secondary/10 p-6 md:p-8 border-2 border-primary/20">
              <p className="text-sm text-muted mb-2">{text.todaysSession}</p>
              <h3 className="font-heading text-2xl font-bold text-primary-dark">{sessionTitle}</h3>
              <p className="text-sm text-muted mt-1">{copy('With', 'உடன்')} {sessionWith}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1.5"><Calendar size={15} /> {liveSessions.today.date}</span>
                <span className="flex items-center gap-1.5"><Clock3 size={15} /> {liveSessions.today.time}</span>
              </div>
              <Link to="/login?role=patient" className="btn btn-primary mt-5">
                <Video size={16} /> {text.loginToJoin}
              </Link>
              <p className="text-xs text-primary mt-2 flex items-center gap-1.5"><Lock size={12} /> {copy('Google Meet opens after patient login', 'நோயாளர் உள்நுழைந்த பிறகு Google Meet திறக்கும்')}</p>
            </div>
            <div className="card-outline p-6">
              <h3 className="font-heading font-semibold text-primary-dark mb-4">{copy('How to Join?', 'எப்படி சேர்வது?')}</h3>
              <ul className="space-y-4 text-sm">
                {[
                  { title: copy('Patient register / login', 'நோயாளர் பதிவு / உள்நுழைவு'), desc: copy('Staff use Login only', 'பணியாளர்கள் உள்நுழைவை மட்டும் பயன்படுத்தவும்'), icon: Lock },
                  { title: copy('Open Live Sessions in dashboard', 'டாஷ்போர்டில் நேரலை அமர்வுகளைத் திறக்கவும்'), desc: copy('Join button appears before start', 'தொடங்குவதற்கு முன் சேரும் பொத்தான் தோன்றும்'), icon: PlayCircle },
                  { title: copy('Join Google Meet', 'Google Meet-ல் சேரவும்'), desc: copy('Secure redirect', 'பாதுகாப்பான மாற்றுப்பக்கம்'), icon: Video },
                  { title: copy('Ask questions', 'கேள்விகளைக் கேளுங்கள்'), desc: copy('Learn and track progress later', 'பின்னர் கற்றுக்கொண்டு முன்னேற்றத்தைக் கண்காணிக்கவும்'), icon: MessageSquareText },
                ].map((s) => (
                  <li key={s.title} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0"><s.icon size={15} /></span>
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-muted text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="nutrition" className="py-16 bg-white scroll-mt-28">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-dark">{text.nutritionTitle}</h2>
            <p className="text-muted mt-2">{text.nutritionLead}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {nutritionPlans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-7 flex flex-col border-2 ${plan.highlight ? 'bg-gold text-white border-gold shadow-2xl md:-translate-y-3' : 'bg-white border-primary/30'}`}>
                <p className={`font-heading font-bold tracking-wide ${plan.highlight ? 'text-white' : 'text-primary-dark'}`}>{plan.name}</p>
                <p className="mt-3">
                  <span className="font-heading text-4xl font-extrabold">₹{plan.price}</span>
                  <span className={plan.highlight ? 'text-white/80' : 'text-muted'}> / {copy('Month', 'மாதம்')}</span>
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check size={16} className={plan.highlight ? 'text-white' : 'text-primary'} /> {featureText[f] || f}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { mode: 'plan', plan } }))} className={`btn w-full mt-7 ${plan.highlight ? 'bg-white text-gold hover:bg-white/90' : 'btn-primary'}`}>{text.getPlan}</button>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {perks.map((p) => (
              <div key={p.title} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <p.icon className="text-primary" size={20} />
                </div>
                <div>
                  <p className="font-medium text-sm">{benefitText[p.title] || p.title}</p>
                  <p className="text-xs text-muted">{benefitText[p.desc] || p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-16 bg-bg scroll-mt-28">
        <div className="container-app grid lg:grid-cols-[0.9fr_1.4fr] gap-6">
          <div className="card-outline p-7">
            <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop" alt="Dr. Srilakshmi" className="w-full h-48 object-cover rounded-2xl img-stroke mb-5" />
            <h3 className="font-heading text-2xl font-bold text-primary-dark">Dr. J. Srilakshmi</h3>
            <p className="text-sm font-medium text-muted mt-2">BHMS, MD (Homoeo)<br />PGDNC, (Clinical Nutrition)</p>
            <p className="text-sm text-muted mt-4">Dedicated to helping you achieve optimal health through holistic healing using natural therapies.</p>
          </div>
          <div className="bg-secondary/10 rounded-2xl p-7 grid sm:grid-cols-3 gap-6 border-2 border-primary/20">
            {values.map((v) => (
              <div key={v.title}>
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-3 border-2 border-primary/20">
                  <v.icon className="text-primary" size={20} />
                </div>
                <p className="font-heading font-semibold text-sm text-primary-dark">{valueText[v.title] || v.title}</p>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">{valueText[v.desc] || v.desc}</p>
              </div>
            ))}
            <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-primary/15">
              {whyChooseUs.map((w) => (
                <div key={w.title} className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-primary/30">
                    <w.icon className="text-primary" size={22} />
                  </div>
                  <p className="text-xs leading-tight"><span className="font-semibold block">{valueText[w.title] || w.title}</span>{valueText[w.desc] || w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="book" className="py-10 bg-white scroll-mt-28">
        <div className="container-app max-w-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl border-2 border-primary/20 bg-secondary/10 px-6 py-5">
            <div>
              <h2 className="font-heading text-2xl font-bold text-primary-dark">{text.ready}</h2>
              <p className="text-sm text-muted mt-1">{copy('Open the Gemini assistant to share your details and choose an available 15-minute slot.', 'உங்கள் விவரங்களைப் பகிர்ந்து கிடைக்கும் 15 நிமிட நேரத்தைத் தேர்ந்தெடுக்க Gemini உதவியாளரைத் திறக்கவும்.')}</p>
            </div>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { mode: 'booking' } }))} className="btn btn-primary shrink-0">
              <Bot size={16} /> {text.openBooking}
            </button>
          </div>
        </div>
      </section>

      <section id="ai" className="py-12 bg-primary-dark text-white">
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bot size={28} />
            <div>
              <p className="font-heading font-semibold text-lg">AI Wellness Assistant</p>
              <p className="text-white/70 text-sm">Diet, lifestyle, homeopathy info, and site help — not a diagnosis.</p>
            </div>
          </div>
          <p className="text-sm text-white/80">Tap the sparkle button at the bottom right anytime.</p>
        </div>
      </section>

      <section id="contact" className="py-16 scroll-mt-28">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-dark">Contact Us</h2>
            <div className="flex gap-3">
              {bubbles.map((Icon, i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-[#C9A876]/30 flex items-center justify-center border-2 border-primary/20">
                  <Icon className="text-primary-dark" size={20} />
                </div>
              ))}
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <ContactForm />
            <ContactInfoCard />
          </div>
        </div>
      </section>
    </div>
  );
}
