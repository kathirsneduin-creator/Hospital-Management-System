// Note: breadcrumbs are intentionally not rendered here (by product decision).
// The `crumbs` prop is still accepted so existing page call-sites don't need
// to be touched, but it is deliberately ignored.
export default function PageHero({ title, subtitle, image, icon: Icon }) {
  return (
    <section className="relative bg-gradient-to-r from-[#EAF6EA] to-[#F3FAF3] overflow-hidden">
      <div className="container-app grid md:grid-cols-2 gap-6 items-center py-14">
        <div>
          {Icon && (
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mb-4">
              <Icon size={22} />
            </div>
          )}
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-dark">{title}</h1>
          {subtitle && <p className="mt-3 text-muted max-w-md">{subtitle}</p>}
        </div>
        {image && (
          <div className="hidden md:block">
            <img src={image} alt="" className="rounded-2xl w-full h-56 object-cover shadow-lg" />
          </div>
        )}
      </div>
    </section>
  );
}
