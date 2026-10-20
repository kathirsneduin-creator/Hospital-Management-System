import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardPath } from '../../lib/roles';
import { publicText } from '../../data/translations';


export default function Register() {
  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    whatsapp: '',
    sameWhatsapp: true,
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, demoMode, language } = useAuth();
  const text = publicText[language];
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const digits = form.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(digits)) return setError(language === 'ta' ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.' : 'Enter a valid 10-digit mobile number.');
    const whatsapp = form.sameWhatsapp ? digits : form.whatsapp.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(whatsapp)) return setError(language === 'ta' ? 'சரியான வாட்ஸ்அப் எண்ணை உள்ளிடவும்.' : 'Enter a valid WhatsApp number.');
    setLoading(true);
    try {
      await register({
        name: form.name,
        phone: digits,
        address: form.address, age: form.age, whatsapp,
      });
      navigate(dashboardPath('patient'));
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        setError(language === 'ta' ? 'இந்த மொபைல் எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. உள்நுழையவும்.' : 'That mobile is already registered — try logging in instead.');
      } else {
        setError(err?.message || (language === 'ta' ? 'பதிவு தோல்வியடைந்தது. உங்கள் விவரங்களைச் சரிபார்க்கவும்.' : 'Registration failed. Please check your details.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-14 px-4 bg-gradient-to-br from-[#EAF6EA] to-[#F3FAF3]">
      <div className="w-full max-w-md card-outline p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="" className="h-14 mx-auto mb-3 img-stroke rounded-full p-1 bg-white" />
          <h1 className="font-heading text-2xl font-bold text-primary-dark">{text.registerTitle}</h1>
          <p className="text-sm text-muted mt-1">{text.registerLead}</p>
        </div>

        {demoMode && (
          <div className="mb-5 text-xs bg-amber-50 border-2 border-amber-200 text-amber-800 rounded-lg px-3.5 py-2.5">
            Demo mode: registration is saved on this device. You can also login as <strong>patient@clinic.demo</strong>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.fullName}</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input className="input !pl-10" name="name" required value={form.name} onChange={change} placeholder="Your full name" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.mobileNumber}</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input className="input !pl-10" name="phone" required value={form.phone} onChange={change} placeholder="98765 43210" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Age</label>
            <input className="input" name="age" type="number" min="1" max="120" required value={form.age} onChange={change} placeholder="Your age" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sameWhatsapp" checked={form.sameWhatsapp} onChange={(e) => setForm({ ...form, sameWhatsapp: e.target.checked, whatsapp: e.target.checked ? form.phone : form.whatsapp })} /> {text.sameWhatsapp}</label>
          {!form.sameWhatsapp && <input className="input" name="whatsapp" required value={form.whatsapp} onChange={change} placeholder="WhatsApp number" />}
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.address}</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 text-muted" size={16} />
              <textarea className="input !pl-10 min-h-[72px]" name="address" required value={form.address} onChange={change} placeholder="House / street / area" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn btn-primary w-full" disabled={loading}>
            <UserPlus size={16} /> {loading ? text.creating : text.createAccount}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          {text.alreadyAccount} <Link to="/login?role=patient" className="text-primary font-medium hover:underline">{text.login}</Link>
        </p>
      </div>
    </div>
  );
}
