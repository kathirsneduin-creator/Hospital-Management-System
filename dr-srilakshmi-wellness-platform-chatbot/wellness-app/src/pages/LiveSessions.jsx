import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Video, Calendar, Clock3, LogIn, PlayCircle, MessageSquareText } from 'lucide-react';
import { liveSessions } from '../data/content';
import PageHero from '../components/ui/PageHero';
import { useAuth } from '../context/AuthContext';

function useCountdown(target) {
  const [left, setLeft] = useState({ h: 2, m: 35, s: 18 });
  useEffect(() => {
    const id = setInterval(() => {
      setLeft((prev) => {
        let { h, m, s } = prev;
        if (s > 0) s -= 1;
        else if (m > 0) { m -= 1; s = 59; }
        else if (h > 0) { h -= 1; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

export default function LiveSessions() {
  const { currentUser, login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const countdown = useCountdown();

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError('');
    try {
      await login(email, password);
    } catch (err) {
      setAuthError('Invalid email or password. Please try again, or register a new account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Live Wellness Sessions"
        subtitle="Join our expert-led live sessions and take a step towards better health."
        icon={Video}
        image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop"
      />

      <section className="py-14">
        <div className="container-app grid lg:grid-cols-[1fr_1.3fr_0.9fr] gap-6">
          {/* Login / already logged in */}
          {!currentUser ? (
            <div className="card-outline p-6">
              <div className="flex items-center gap-2 mb-5 text-primary-dark font-heading font-semibold">
                <Lock size={18} /> Login to Join Live Session
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Email Address</label>
                  <input className="input" type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Password</label>
                  <input className="input" type="password" required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {authError && <p className="text-sm text-red-600">{authError}</p>}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted">
                    <input type="checkbox" className="accent-primary" /> Remember Me
                  </label>
                  <Link to="/login" className="text-primary hover:underline">Forgot Password?</Link>
                </div>
                <button className="btn btn-primary w-full" disabled={submitting}>
                  <LogIn size={16} /> {submitting ? 'Logging in...' : 'Login'}
                </button>
                <p className="text-center text-sm text-muted">
                  New Here? <Link to="/register" className="text-primary font-medium hover:underline">Register Now</Link>
                </p>
              </form>
            </div>
          ) : (
            <div className="card-outline p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center">
                <Video className="text-primary" size={26} />
              </div>
              <p className="font-heading font-semibold">You're logged in!</p>
              <p className="text-sm text-muted">Head to your dashboard to join live sessions and watch recordings.</p>
              <Link to="/dashboard/patient" className="btn btn-primary w-full">Go to Dashboard</Link>
            </div>
          )}

          {/* Today's session */}
          <div className="rounded-2xl bg-secondary/10 p-6 md:p-8">
            <p className="text-sm text-muted mb-2">Today's Live Session</p>
            <h3 className="font-heading text-2xl font-bold text-primary-dark">{liveSessions.today.title}</h3>
            <p className="text-sm text-muted mt-1">With {liveSessions.today.with}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-ink/80">
              <span className="flex items-center gap-1.5"><Calendar size={15} /> {liveSessions.today.date}</span>
              <span className="flex items-center gap-1.5"><Clock3 size={15} /> {liveSessions.today.time}</span>
            </div>
            <button
              onClick={() => (currentUser ? navigate('/dashboard/patient') : navigate('/login'))}
              className="btn btn-primary mt-5"
            >
              <Video size={16} /> Join Live Session
            </button>
            <p className="text-xs text-primary mt-2 flex items-center gap-1.5"><Lock size={12} /> You will be redirected to Google Meet securely</p>

            <div className="grid grid-cols-3 gap-3 mt-6 text-center">
              {[
                { v: countdown.h, l: 'Hours' },
                { v: countdown.m, l: 'Minutes' },
                { v: countdown.s, l: 'Seconds' },
              ].map((c) => (
                <div key={c.l} className="bg-white rounded-xl py-3">
                  <p className="font-heading font-bold text-2xl text-primary-dark">{String(c.v).padStart(2, '0')}</p>
                  <p className="text-xs text-muted">{c.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How to join */}
          <div className="card-outline p-6">
            <h3 className="font-heading font-semibold text-primary-dark mb-4">How to Join?</h3>
            <ul className="space-y-4 text-sm">
              {[
                { title: 'Login to your account', desc: 'Using your registered email & password', icon: LogIn },
                { title: 'Click on Join Live Session', desc: 'Button will appear here before session starts', icon: PlayCircle },
                { title: 'Join the Google Meet', desc: 'You will be redirected automatically', icon: Video },
                { title: 'Interact & Learn', desc: 'Ask questions and improve your health', icon: MessageSquareText },
              ].map((s) => (
                <li key={s.title} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <s.icon size={15} />
                  </span>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-muted text-xs mt-0.5">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upcoming / Previous */}
        <div className="container-app grid lg:grid-cols-2 gap-8 mt-12">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-lg text-primary-dark">Upcoming Sessions</h3>
              <Link to="/dashboard/patient" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {liveSessions.upcoming.map((s) => (
                <div key={s.title} className="card-outline p-3 flex gap-3 items-center">
                  <img src={s.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.title}</p>
                    <p className="text-xs text-muted">With {s.with}</p>
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5"><Calendar size={11} /> {s.date} · {s.time}</p>
                  </div>
                  <Link to="/appointments" className="btn btn-outline !py-1.5 !px-3 !text-xs shrink-0">Register</Link>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-lg text-primary-dark">Previous Sessions</h3>
              <Link to="/dashboard/patient" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {liveSessions.previous.map((s) => (
                <div key={s.title} className="card-outline p-3 flex gap-3 items-center">
                  <img src={s.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.title}</p>
                    <p className="text-xs text-muted">{s.date}</p>
                  </div>
                  <Link to="/login" className="btn btn-outline !py-1.5 !px-3 !text-xs shrink-0">Watch Now</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-dark text-white py-8">
        <div className="container-app flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-heading font-semibold text-lg">Don't miss our live sessions!</p>
            <p className="text-white/70 text-sm">Stay healthy, stay happy.</p>
          </div>
          <Link to="/appointments" className="btn btn-glass">View All Live Sessions</Link>
        </div>
      </section>
    </div>
  );
}
