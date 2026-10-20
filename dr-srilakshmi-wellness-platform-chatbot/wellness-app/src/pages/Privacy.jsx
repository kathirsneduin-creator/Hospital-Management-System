import PageHero from '../components/ui/PageHero';

export default function Privacy() {
  return (
    <div>
      <PageHero title="Privacy Policy" crumbs={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]} />
      <section className="py-14">
        <div className="container-app max-w-3xl prose text-sm text-muted leading-relaxed">
          <p>
            Dr. Srilakshmi Homeo &amp; Yoga Clinic collects only the information needed to provide care —
            your name, contact details, and health information you choose to share when booking appointments
            or using the AI Wellness Assistant. We never sell your data. Medical records are stored securely
            and shared only with your treating doctor.
          </p>
          <p className="mt-4">
            For questions about your data, contact us at info@drsrilakshmihomeo.com.
          </p>
        </div>
      </section>
    </div>
  );
}
