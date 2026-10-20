import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-heading text-7xl font-bold text-secondary">404</p>
      <h1 className="font-heading text-2xl font-bold text-primary-dark mt-3">Page Not Found</h1>
      <p className="text-muted mt-2 max-w-sm">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary mt-6">
        <Home size={16} /> Back to Home
      </Link>
    </div>
  );
}
