import PageHero from '../components/ui/PageHero';

export default function Terms() {
  return (
    <div>
      <PageHero title="Terms & Conditions" crumbs={[{ label: 'Home', to: '/' }, { label: 'Terms & Conditions' }]} />
      <section className="py-14">
        <div className="container-app max-w-3xl prose text-sm text-muted leading-relaxed">
          <p>
            By using this website and booking appointments, you agree that the content provided (including
            AI Wellness Assistant responses) is general guidance only and not a substitute for an in-person
            medical diagnosis. Appointment slots are confirmed by clinic staff and are subject to availability.
          </p>
        </div>
      </section>
    </div>
  );
}
