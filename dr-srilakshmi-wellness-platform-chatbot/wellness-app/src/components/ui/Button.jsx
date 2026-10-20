import { Link } from 'react-router-dom';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  glass: 'btn-glass',
};

export default function Button({
  as,
  to,
  href,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  ...props
}) {
  const classes = `btn ${variants[variant] || variants.primary} ${className}`;
  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon size={18} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={18} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
