import { Link } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';
import { programs } from '../data/content';
import PageHero from '../components/ui/PageHero';

export default function Programs() {
  return (
    <div>
      <PageHero
        title="Our Programs"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Programs' }]}
        image="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1200&auto=format&fit=crop"
      />

      <section className="py-16">
        <div className="container-app">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-dark">Wellness Programs for Your Better Health</h2>
            <div className="w-16 h-0.5 bg-secondary mx-auto my-4" />
            <p className="text-muted">
              Our specialized programs are designed to address various health concerns naturally through Homeopathy, Yoga, and Nutrition.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {programs.map((p) => (
              <div key={p.slug} className="card card-hover overflow-hidden">
                <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-primary-dark">{p.title}</h3>
                  <p className="text-sm text-muted mt-1.5">{p.description}</p>
                  <Link to="/appointments" className="btn btn-outline w-full mt-4 !py-2 !text-sm">Know More</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-secondary/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                <HeartHandshake className="text-primary" size={22} />
              </div>
              <div>
                <p className="font-heading font-semibold text-primary-dark">Not sure which program is right for you?</p>
                <p className="text-sm text-muted">Book a consultation with our experts and get personalized guidance.</p>
              </div>
            </div>
            <Link to="/appointments" className="btn btn-primary shrink-0">Book Consultation</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
