import { parseSlotLabel } from './slots';

function pad(n) {
  return String(n).padStart(2, '0');
}

function toCalendarStamp(date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

export function googleCalendarUrl({
  title,
  date,
  time,
  durationMin = 15,
  details = '',
  location = 'Dr. Srilakshmi Homeo & Yoga Clinic',
}) {
  const parsed = parseSlotLabel(time);
  const start = new Date(`${date}T00:00:00`);
  if (parsed) {
    start.setHours(parsed.hours, parsed.minutes, 0, 0);
  }
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
