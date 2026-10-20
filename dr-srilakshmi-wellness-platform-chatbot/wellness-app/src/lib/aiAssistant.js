const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

const FALLBACK_REPLY = "I can still help while live AI reconnects. Our popular programs include Stress Relief, Diabetes Care, and Joy of Breathing. You can also open Book Appointment to choose a doctor and an available 15-minute slot.";

const SYSTEM_CONTEXT = `You are the AI Wellness Assistant for Dr. Srilakshmi Homeo & Yoga Clinic, a clinic offering
Homeopathy, Medical Yoga, and Clinical Nutrition. Answer briefly and warmly. You may give general wellness,
yoga, and nutrition information, and explain what homeopathy programs the clinic offers (Joy of Breathing,
Weight Loss Program, Diabetes Care, Thyroid Care, Women's Wellness, Stress Relief Program, Arthritis Care,
Skin Care Program, Children Wellness, Nutrition & Diet Plans). Never diagnose a condition or prescribe a
specific medicine or dosage. For any symptom that sounds serious or for anything requiring diagnosis or
prescription, tell the person to book a consultation with Dr. Srilakshmi and offer to help them book an
appointment.`;

/**
 * Sends the conversation to Gemini and returns the assistant's reply text.
 * Falls back to a helpful canned response if no API key is configured yet,
 * so the UI is fully demoable before Firebase/Gemini credentials are added.
 */
export async function askWellnessAssistant(history, language = 'en') {
  if (!GEMINI_KEY) {
    return language === 'ta'
      ? 'மனஅழுத்த நிவாரணம், நீரிழிவு பராமரிப்பு மற்றும் சுவாசப் பயிற்சி திட்டங்கள் எங்களிடம் உள்ளன. மருத்துவரையும் கிடைக்கும் 15 நிமிட நேரத்தையும் தேர்ந்தெடுக்க ஆலோசனையை முன்பதிவு செய்யலாம்.'
      : FALLBACK_REPLY;
  }

  const contents = [
    { role: 'user', parts: [{ text: `${SYSTEM_CONTEXT}\nRespond entirely in ${language === 'ta' ? 'Tamil' : 'English'}. Do not mix languages.` }] },
    { role: 'model', parts: [{ text: 'Understood. I will follow these guidelines.' }] },
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) return FALLBACK_REPLY;

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
    FALLBACK_REPLY
  );
}
