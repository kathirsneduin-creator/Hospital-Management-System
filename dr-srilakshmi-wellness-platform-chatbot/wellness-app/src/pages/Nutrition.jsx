import { Link } from 'react-router-dom';
import { Check, Salad, UserCheck, TrendingUp, Trophy } from 'lucide-react';
import { nutritionPlans } from '../data/content';
import PageHero from '../components/ui/PageHero';

const perks = [
  { icon: Salad, title: 'Personalized Diet', desc: 'Tailored to your body & goals' },
  { icon: UserCheck, title: 'Expert Guidance', desc: 'By nutritionist' },
  { icon: TrendingUp, title: 'Track & Improve', desc: 'Your progress' },
  { icon: Trophy, title: 'Get Results', desc: 'With consistency' },
];

export default function Nutrition() {
  return (
    <div>
      <PageHero
        title="Premium Nutrition Plans"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Nutrition' }]}
        image="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop"
      />

      <section className="py-16">
        <div className="container-app">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {nutritionPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 flex flex-col ${
                  plan.highlight
                    ? 'bg-gold text-white shadow-2xl md:-translate-y-3'
                    : 'bg-white card-outline'
                }`}
              >
                <p className={`font-heading font-bold tracking-wide ${plan.highlight ? 'text-white' : 'text-primary-dark'}`}>{plan.name}</p>
                <p className="mt-3">
                  <span className="font-heading text-4xl font-extrabold">₹{plan.price}</span>
                  <span className={plan.highlight ? 'text-white/80' : 'text-muted'}> / Month</span>
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check size={16} className={plan.highlight ? 'text-white' : 'text-primary'} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { mode: 'plan', plan } }))}
                  className={`btn w-full mt-7 ${plan.highlight ? 'bg-white text-gold hover:bg-white/90' : 'btn-primary'}`}
                >
                  Buy Now
                </button>
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
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-dark text-white py-8">
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-heading font-semibold text-lg">Eat Right, Live Bright</p>
            <p className="text-white/70 text-sm">Nutrition is the foundation of a healthier you!</p>
          </div>
          <Link to="/appointments" className="btn btn-glass">View All Diet Plans</Link>
        </div>
      </section>
    </div>
  );
}
