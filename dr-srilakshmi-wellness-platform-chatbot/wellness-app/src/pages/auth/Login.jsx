import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { dashboardPath } from '../../lib/roles';
import { DEMO_PASSWORD } from '../../lib/localDb';
import { publicText } from '../../data/translations';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser, role: currentRole, demoMode, language } = useAuth();
  const text = publicText[language];
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentRole) navigate(dashboardPath(currentRole), { replace: true });
  }, [currentUser, currentRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const account = await login(email, password);
      navigate(dashboardPath(account?.role || currentRole || 'patient'));
    } catch (err) {
      setError(err?.message || (language === 'ta' ? 'உள்நுழைவு தோல்வியடைந்தது. உங்கள் விவரங்களைச் சரிபார்க்கவும்.' : 'Login failed. Check your details.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) return setError(language === 'ta' ? 'முதலில் உங்கள் மின்னஞ்சலை உள்ளிட்டு, கடவுச்சொல்லை மறந்துவிட்டீர்களா என்பதைத் தேர்ந்தெடுக்கவும்.' : 'Enter your email above first, then tap "Forgot Password?"');
    if (!auth) return setError(language === 'ta' ? 'கடவுச்சொல் மீட்டமைப்புக்கு Firebase தேவை. சோதனை முறையில் Demo@123 பயன்படுத்தவும்.' : 'Password reset needs Firebase. In demo mode use Demo@123.');
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo(language === 'ta' ? 'கடவுச்சொல் மீட்டமைப்பு மின்னஞ்சல் அனுப்பப்பட்டது. உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்.' : 'Password reset email sent. Check your inbox.');
    } catch {
      setError(language === 'ta' ? 'மீட்டமைப்பு மின்னஞ்சலை அனுப்ப முடியவில்லை. முகவரியைச் சரிபார்க்கவும்.' : 'Could not send reset email. Double-check the address.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-14 px-4 bg-gradient-to-br from-[#EAF6EA] to-[#F3FAF3]">
      <div className="w-full max-w-md card-outline p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Dr. Srilakshmi Wellness" className="h-16 w-16 object-contain mx-auto mb-3 img-stroke rounded-full p-1 bg-white" />
          <h1 className="font-heading text-2xl font-bold text-primary-dark">{text.loginTitle}</h1>
          <p className="text-sm text-muted mt-1">{text.loginLead}</p>
        </div>

        {demoMode && (
          <div className="mb-5 text-xs bg-amber-50 border-2 border-amber-200 text-amber-800 rounded-lg px-3.5 py-2.5">
            Staff login: use the matching email for this role and password <strong>{DEMO_PASSWORD}</strong>.
            <br />
            doctor@clinic.demo · admin@clinic.demo · reception@clinic.demo · worker@clinic.demo
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.emailMobile}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input className="input !pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com or 10-digit mobile" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.password}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input className="input !pl-10 !pr-11" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-primary">{info}</p>}

          <div className="flex justify-end text-sm">
            <button type="button" onClick={handleReset} className="text-primary hover:underline">{text.forgot}</button>
          </div>

          <button className="btn btn-primary w-full" disabled={loading}>
            <LogIn size={16} /> {loading ? text.loggingIn : text.login}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          {text.patientNew} <Link to="/register" className="text-primary font-medium hover:underline">{text.registerNow}</Link>
        </p>
      </div>
    </div>
  );
}
