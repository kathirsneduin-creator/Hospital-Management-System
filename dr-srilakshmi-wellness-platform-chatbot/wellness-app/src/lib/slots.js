function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toLabel(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function parseSlotLabel(label) {
  const match = String(label).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

export function generateQuarterHourSlots({
  start = '09:00',
  end = '18:00',
  lunchStart = '13:00',
  lunchEnd = '14:00',
  interval = 15,
} = {}) {
  const slots = [];
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const lunchFrom = toMinutes(lunchStart);
  const lunchTo = toMinutes(lunchEnd);

  for (let t = startMin; t + interval <= endMin; t += interval) {
    if (t >= lunchFrom && t < lunchTo) continue;
    slots.push(toLabel(t));
  }
  return slots;
}

export function nextFourteenDates(locale = 'en-IN') {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      iso: d.toISOString().slice(0, 10),
      weekday: d.getDay(),
      label: d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }
  return dates;
}

export function slotTaken(appointments, { doctorId, date, time }) {
  return (appointments || []).some(
    (a) =>
      a.doctorId === doctorId &&
      a.date === date &&
      a.time === time &&
      a.status !== 'cancelled'
  );
}

export function remainingSlots(doctor, dateIso, appointments) {
  if (!doctor || !dateIso) return [];
  const day = new Date(`${dateIso}T00:00:00`).getDay();
  if (!doctor.workingDays.includes(day)) return [];
  return (doctor.slots || []).filter((time) => !slotTaken(appointments, { doctorId: doctor.id, date: dateIso, time }));
}

export function patientHasBookingOnDate(appointments, { patientId, phone, date }) {
  return (appointments || []).some((appointment) => {
    if (appointment.date !== date || appointment.status === 'cancelled') return false;
    if (patientId && appointment.patientId) return appointment.patientId === patientId;
    return !appointment.patientId && phone && appointment.phone === phone;
  });
}
