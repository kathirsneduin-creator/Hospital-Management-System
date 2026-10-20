const variants = {
  default: 'card card-hover',
  outline: 'card-outline card-hover',
  glass: 'card-glass',
  dark: 'card-dark',
};

export function Card({ variant = 'default', className = '', children, ...props }) {
  return (
    <div className={`${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = true, light = false }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <p className={`text-sm uppercase tracking-wide font-semibold mb-2 ${light ? 'text-secondary-light' : 'text-primary'}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`font-heading text-3xl md:text-4xl font-bold ${light ? 'text-white' : 'text-primary-dark'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 max-w-2xl ${center ? 'mx-auto' : ''} ${light ? 'text-white/80' : 'text-muted'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
