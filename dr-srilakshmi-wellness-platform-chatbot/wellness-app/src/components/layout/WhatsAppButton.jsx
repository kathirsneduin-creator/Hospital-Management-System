import { MessageCircle } from 'lucide-react';

const PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '919443629722';
const DEFAULT_MESSAGE = encodeURIComponent(
  "Hi Dr. Srilakshmi Homeo & Yoga Clinic! I'd like to know more about your treatments."
);

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${PHONE}?text=${DEFAULT_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="WhatsApp"
      className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform animate-float"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  );
}
