import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { publicText } from '../../data/translations';

export default function LoginRoleMenu({ variant = 'desktop', onNavigate }) {
  const { language } = useAuth();
  return (
    <Link
      to="/login"
      onClick={onNavigate}
      className={`btn ${variant === 'mobile' ? 'btn-outline w-full mb-2' : 'btn-ghost !px-3 text-sm'}`}
    >
      <LogIn size={16} /> {publicText[language].login}
    </Link>
  );
}
