const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function sendBookingNotification({ mobile, whatsapp, message, contentVariables }) {
  const response = await fetch(`${API_BASE}/notifications/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, whatsapp, message, contentVariables }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.detail || result?.error || 'Notification service unavailable');
  return result;
}