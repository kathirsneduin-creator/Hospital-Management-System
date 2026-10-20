import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Send, Bot, CalendarCheck, ArrowLeft } from 'lucide-react';
import { askWellnessAssistant } from '../../lib/aiAssistant';
import ConsultationChatbot from '../booking/ConsultationChatbot';
import NutritionPlanChatbot from '../booking/NutritionPlanChatbot';
import { useAuth } from '../../context/AuthContext';
import { publicText } from '../../data/translations';

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm the Dr. Srilakshmi AI Wellness Assistant. Ask me about our programs, yoga, nutrition, or how to book a consultation.",
};

const QUICK_PROMPTS = ['Stress relief', 'Nutrition plans', 'Book a consultation'];

export default function AIAssistantWidget() {
  const { language } = useAuth();
  const text = publicText[language];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ ...WELCOME, content: text.chatWelcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState(false);
  const [planMode, setPlanMode] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages((current) => current.length === 1 && current[0].role === 'assistant' ? [{ ...WELCOME, content: text.chatWelcome }] : current);
  }, [language, text.chatWelcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    const openAssistant = (event) => {
      setOpen(true);
      if (event.detail?.mode === 'booking') setBookingMode(true);
      if (event.detail?.mode === 'plan') setPlanMode(event.detail.plan);
    };
    window.addEventListener('open-ai-assistant', openAssistant);
    return () => window.removeEventListener('open-ai-assistant', openAssistant);
  }, []);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const reply = await askWellnessAssistant(next, language);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: language === 'ta' ? 'நேரலை செயற்கை நுண்ணறிவு சிறிது நேரம் இடைவேளை எடுத்துள்ளது. எங்கள் திட்டங்களைப் பார்க்க அல்லது ஆலோசனையை முன்பதிவு செய்ய நான் உதவுகிறேன்.' : 'Live AI is taking a short pause. I can still help you explore our programs or book a consultation below.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? text.back : text.footerNote}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {open ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      <div
        className={`fixed bottom-24 right-6 z-40 w-[92vw] max-w-sm h-[70vh] max-h-[560px] card-glass shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ background: '#fff' }}
      >
        <div className="bg-primary text-white px-5 py-4 flex items-center gap-3">
          {(bookingMode || planMode) && (
            <button type="button" onClick={() => { setBookingMode(false); setPlanMode(null); }} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center" aria-label={text.back}>
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            {bookingMode || planMode ? <CalendarCheck size={18} /> : <Bot size={18} />}
          </div>
          <div className="min-w-0">
            <p className="font-heading font-semibold text-sm leading-tight">{bookingMode ? text.bookConsultation : planMode ? text.nutritionTitle : text.footerNote}</p>
            <p className="text-xs text-white/75 leading-tight">{bookingMode ? text.chooseDoctor : planMode ? text.approval : text.guidance}</p>
          </div>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-300 shrink-0" aria-label="Assistant ready" />
        </div>

        {bookingMode ? (
          <div className="flex-1 min-h-0 bg-bg">
            <ConsultationChatbot compact />
          </div>
        ) : planMode ? (
          <div className="flex-1 min-h-0 bg-bg"><NutritionPlanChatbot plan={planMode} onBack={() => setPlanMode(null)} /></div>
        ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 py-4 space-y-3 bg-bg">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white text-ink border border-secondary/30 rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-secondary/30 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          {!loading && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {[text.stressRelief, text.nutritionPlans, text.bookConsultationShort].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-full border-2 border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
        )}

        {!bookingMode && !planMode && <div className="border-t border-secondary/20 bg-white p-3">
          <button type="button" onClick={() => setBookingMode(true)} className="mb-2 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-primary/20 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors">
            <CalendarCheck size={14} /> {text.bookConsultationShort}
          </button>
          <form onSubmit={send} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder={text.askAssistant}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary !px-3" aria-label={text.sendMessage} disabled={loading}>
            <Send size={18} />
          </button>
          </form>
        </div>}
      </div>
    </>
  );
}
