import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, Send, Salad } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { nutritionPlans } from '../../data/content';
import { findUserByPhone, findUsersByPhone } from '../../lib/localDb';
import { createNutritionRequest, createAppointment } from '../../lib/appointmentService';
import { sendBookingNotification } from '../../lib/notifications';
import { doctors, isDoctorAvailableOn } from '../../data/doctors';
import { nextFourteenDates, remainingSlots } from '../../lib/slots';
import { subscribeAppointments } from '../../lib/appointmentService';

const STEPS = ['name', 'mobile', 'profile', 'mode', 'date', 'time', 'confirm', 'done'];

export default function NutritionPlanChatbot({ plan, onBack }) {
  const { currentUser, userProfile, register, language } = useAuth();
  const tamil = language === 'ta';
  const tx = tamil ? { request: 'ஊட்டச்சத்து திட்டக் கோரிக்கை', name: 'நோயாளியின் முழுப் பெயர் என்ன?', mobile: 'இந்த திட்டத்திற்கு எந்த மொபைல் எண்ணைப் பயன்படுத்தலாம்?', family: 'இந்த திட்டத்திற்கான குடும்ப உறுப்பினரைத் தேர்ந்தெடுக்கவும்.', mode: 'மருத்துவர் இந்த திட்டத்தைச் செயல்படுத்துவதற்கு முன் ஆலோசனை முறையைத் தேர்ந்தெடுக்கவும்.', date: 'ஆலோசனை தேதியைத் தேர்ந்தெடுக்கவும்.', time: 'கிடைக்கும் ஆலோசனை நேரத்தைத் தேர்ந்தெடுக்கவும்.', patient: 'நோயாளர்', patientId: 'நோயாளர் அடையாள எண்', plan: 'திட்டம்', modeLabel: 'முறை', consultation: 'ஆலோசனை', create: 'உருவாக்கப்படும்', submit: 'சமர்ப்பிக்கிறது...', confirm: 'திட்டக் கோரிக்கையை உறுதிப்படுத்துக', sent: 'மருத்துவருக்கு கோரிக்கை அனுப்பப்பட்டது', after: 'மருத்துவர் ஒப்புதல் அளித்த பிறகு திட்டம் உங்கள் டாஷ்போர்டில் தோன்றும்.', requestId: 'கோரிக்கை அடையாள எண்', fullName: 'முழுப் பெயர்', mobileNumber: 'மொபைல் எண்', clinic: 'நேரடி மருத்துவமனை வருகை', video: 'காணொளி ஆலோசனை', phone: 'தொலைபேசி ஆலோசனை' } : { request: 'Nutrition plan request', name: "What is the patient's full name?", mobile: 'What mobile number should we use for this plan?', family: 'Choose the family member for this plan.', mode: 'Choose how you want to consult before the doctor activates this plan.', date: 'Choose your consultation date.', time: 'Choose an available consultation time.', patient: 'Patient', patientId: 'Patient ID', plan: 'Plan', modeLabel: 'Mode', consultation: 'Consultation', create: 'will be created', submit: 'Submitting...', confirm: 'Confirm plan request', sent: 'Request sent to the doctor', after: 'The plan will appear in your dashboard after doctor approval.', requestId: 'Request ID', fullName: 'Full name', mobileNumber: 'Mobile number', clinic: 'In-Clinic Visit', video: 'Video Consultation', phone: 'Phone Consultation' };
  const modeLabels = { 'In-clinic Visit': tx.clinic, 'Video Consultation': tx.video, 'Phone Consultation': tx.phone };
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [request, setRequest] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ name: userProfile?.name || '', mobile: userProfile?.phone || '', patientId: userProfile?.patientId || '', mode: '', date: '', time: '' });

  useEffect(() => subscribeAppointments(setAppointments), []);

  const current = STEPS[step];
  const doctor = doctors[0];
  const availableDates = nextFourteenDates(tamil ? 'ta-IN' : 'en-IN').filter((date) => isDoctorAvailableOn(doctor, date.iso));
  const availableTimes = form.date ? remainingSlots(doctor, form.date, appointments) : [];
  const profiles = form.mobile ? findUsersByPhone(form.mobile) : [];
  const selectedPlan = plan || nutritionPlans[0];

  function advance(patch) { setForm((value) => ({ ...value, ...patch })); setError(''); setStep((value) => value + 1); }

  function submitText(event) {
    event.preventDefault();
    const value = input.trim();
    if (current === 'name' && value.length >= 2) { setInput(''); advance({ name: value }); return; }
    if (current === 'mobile') {
      const digits = value.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(digits)) { setError('Enter a valid 10-digit mobile number.'); return; }
      const existing = findUserByPhone(digits);
      setInput('');
      if (existing) { const matchingProfiles = findUsersByPhone(digits); setForm((f) => ({ ...f, mobile: digits, name: matchingProfiles.length === 1 ? existing.name : '', patientId: matchingProfiles.length === 1 ? existing.patientId || '' : '' })); setStep(matchingProfiles.length > 1 ? 2 : 3); } else advance({ mobile: digits });
      return;
    }
    setError(tamil ? 'கோரப்பட்ட விவரத்தை உள்ளிடவும்.' : 'Please enter the requested detail.');
  }

  async function confirm() {
    setSaving(true);
    let patientId = form.patientId || currentUser?.patientId || userProfile?.patientId;
    if (!patientId) {
      try { const account = await register({ name: form.name, phone: form.mobile }); patientId = account?.patientId; } catch { patientId = findUserByPhone(form.mobile)?.patientId; }
    }
    const payload = { planName: selectedPlan.name, price: selectedPlan.price, patientId, patientName: form.name, patientPhone: form.mobile, consultationType: form.mode, consultationDate: form.date, consultationTime: form.time, doctorId: 'dr-srilakshmi', status: 'pending' };
    const created = await createNutritionRequest(payload);
    await createAppointment({
      name: form.name,
      phone: form.mobile,
      whatsapp: userProfile?.whatsapp || form.mobile,
      patientId,
      doctorId: 'dr-srilakshmi',
      doctorName: doctor.name,
      date: form.date,
      time: form.time,
      durationMin: 15,
      consultationType: form.mode,
      healthConcern: `${selectedPlan.name} consultation`,
      program: selectedPlan.name,
      planRequestId: created.id,
      status: 'pending',
      source: 'nutrition-plan',
    });
    setRequest(created);
    try { await sendBookingNotification({ mobile: form.mobile, whatsapp: userProfile?.whatsapp || form.mobile, message: `Nutrition plan request received: ${selectedPlan.name}. ${form.date} at ${form.time}. Mode: ${form.mode}. Patient ID: ${patientId}. A doctor will review and activate your plan.` }); } catch { /* request remains saved */ }
    setSaving(false); setStep(5);
  }

  return <div className="flex h-full min-h-0 flex-col bg-white">
    <div className="flex items-center gap-3 bg-primary px-4 py-3 text-white"><button type="button" onClick={onBack} aria-label={tamil ? 'பின்னால்' : 'Back'}><ChevronLeft size={17} /></button><Salad size={18} /><div><p className="font-heading text-sm font-semibold">{selectedPlan.name}</p><p className="text-xs text-white/75">{tx.request}</p></div></div>
    <div className="flex-1 overflow-y-auto bg-bg p-4 space-y-3">
      {current === 'name' && <p className="rounded-xl border-2 border-primary/20 bg-white p-3 text-sm">{tx.name}</p>}
      {current === 'mobile' && <p className="rounded-xl border-2 border-primary/20 bg-white p-3 text-sm">{tx.mobile}</p>}
      {current === 'profile' && <><p className="rounded-xl border-2 border-primary/20 bg-white p-3 text-sm">{tx.family}</p>{profiles.map((profile) => <button key={profile.patientId} type="button" onClick={() => { setForm({ ...form, name: profile.name, patientId: profile.patientId }); setStep(3); }} className="block w-full rounded-xl border-2 border-primary/25 bg-white p-3 text-left text-sm"><b>{profile.name}</b><span className="block text-xs text-muted">{tx.patientId} {profile.patientId}</span></button>)}</>}
      {current === 'mode' && <><p className="rounded-xl border-2 border-primary/20 bg-white p-3 text-sm">{tx.mode}</p>{['In-clinic Visit', 'Video Consultation', 'Phone Consultation'].map((mode) => <button key={mode} type="button" onClick={() => advance({ mode })} className="block w-full rounded-xl border-2 border-primary/25 bg-white p-3 text-left text-sm hover:border-primary">{modeLabels[mode]}</button>)}</>}
      {current === 'date' && <><p className="rounded-xl border-2 border-primary/20 bg-white p-3 text-sm">{tx.date}</p>{availableDates.map((date) => <button key={date.iso} type="button" onClick={() => advance({ date: date.iso, time: '' })} className="block w-full rounded-xl border-2 border-primary/25 bg-white p-3 text-left text-sm hover:border-primary">{date.label}</button>)}</>}
      {current === 'time' && <><p className="rounded-xl border-2 border-primary/20 bg-white p-3 text-sm">{tx.time}</p><div className="grid grid-cols-3 gap-2">{availableTimes.map((time) => <button key={time} type="button" onClick={() => advance({ time })} className="rounded-lg border-2 border-primary/25 bg-white px-2 py-2 text-xs font-semibold hover:border-primary">{time}</button>)}</div></>}
      {current === 'confirm' && <div className="rounded-xl border-2 border-primary/20 bg-white p-4 text-sm space-y-2"><p><b>{tx.patient}:</b> {form.name}</p><p><b>{tx.patientId}:</b> {form.patientId || tx.create}</p><p><b>{tx.plan}:</b> {selectedPlan.name} · ₹{selectedPlan.price}/{tamil ? 'மாதம்' : 'month'}</p><p><b>{tx.modeLabel}:</b> {modeLabels[form.mode] || form.mode}</p><p><b>{tx.consultation}:</b> {form.date} {tamil ? 'அன்று' : 'at'} {form.time}</p><button type="button" disabled={saving} onClick={confirm} className="btn btn-primary w-full mt-2"><CheckCircle2 size={15} /> {saving ? tx.submit : tx.confirm}</button></div>}
      {current === 'done' && <div className="rounded-xl border-2 border-primary/20 bg-white p-5 text-center"><CheckCircle2 className="mx-auto text-primary" size={38} /><p className="mt-2 font-heading font-bold text-primary-dark">{tx.sent}</p><p className="mt-1 text-xs text-muted">{tx.after}</p><p className="mt-2 text-xs text-primary">{tx.requestId}: {request?.id}</p></div>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
    {(current === 'name' || current === 'mobile') && <form onSubmit={submitText} className="flex gap-2 border-t-2 border-primary/15 bg-white p-3"><input className="input flex-1" value={input} onChange={(event) => setInput(event.target.value)} placeholder={current === 'name' ? tx.fullName : tx.mobileNumber} inputMode={current === 'mobile' ? 'numeric' : 'text'} autoFocus /><button className="btn btn-primary !px-3" aria-label={tamil ? 'அனுப்புக' : 'Send'}><Send size={16} /></button></form>}
  </div>;
}