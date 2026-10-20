import { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import ConsultationChatbot from './ConsultationChatbot';

export default function BookingChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close consultation booking chat' : 'Book a consultation'}
        className="fixed bottom-24 left-6 z-40 w-14 h-14 rounded-full bg-primary-dark text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {open ? <X size={24} /> : <CalendarPlus size={24} />}
      </button>

      <div
        className={`fixed bottom-[176px] left-6 z-40 w-[92vw] max-w-sm h-[70vh] max-h-[600px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ConsultationChatbot />
      </div>
    </>
  );
}
