import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, CheckCircle2, ChevronLeft, CalendarDays, Clock3, Stethoscope,
  Droplets, Activity, Scale, HeartPulse, Flower2, Wind, Bone, Sparkles,
  Baby, Salad, Building2, Video, Phone, User, MapPin, Award, RotateCcw,
  Pencil, ExternalLink,
  Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctors, healthConcerns, consultationTypes, isDoctorAvailableOn } from '../../data/doctors';
import { remainingSlots, nextFourteenDates, patientHasBookingOnDate } from '../../lib/slots';
import { createAppointment, subscribeAppointments } from '../../lib/appointmentService';
import { googleCalendarUrl } from '../../lib/googleCalendar';
import { findUserByPhone, findUsersByPhone } from '../../lib/localDb';
import { sendBookingNotification } from '../../lib/notifications';

const ICONS = {
  Droplets, Activity, Scale, HeartPulse, Flower2, Wind, Bone, Sparkles,
  Baby, Salad, Stethoscope, Building2, Video, Phone,
};

const STEPS = ['name', 'age', 'mobile', 'whatsapp', 'address', 'password', 'confirmPassword', 'profile', 'consultationType', 'healthConcern', 'doctor', 'date', 'time', 'confirm', 'done'];

const STEP_PROMPTS = {
  name: "Let's get your consultation booked. First, what's your full name?",
  mobile: 'Thanks! What mobile number can we reach you on?',
  age: 'How old is the patient?',
  whatsapp: 'What WhatsApp number should receive the booking details?',
  address: "Great. What's your address?",
  password: 'Create a password for your new patient account.',
  confirmPassword: 'Confirm your new account password.',
  profile: 'I found multiple family profiles on this mobile. Who is this consultation for?',
  consultationType: 'How would you like to consult with the doctor?',
  healthConcern: "What's the main health concern you'd like to discuss?",
  doctor: "Here are doctors who can help — pick one you'd like to see.",
  date: 'Pick a date that works for you. Only days the doctor works are shown.',
  time: 'Choose an open 15-minute slot. Booked times (including 3:00–3:15 if 3:00 is taken) stay hidden.',
  confirm: 'Please review your booking before confirming.',
};

function formatDateLabel(iso, language = 'en') {
  if (!iso) return '';
  return new Date(`${iso}T00:00:00`).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function genRef() {
  return 'DSW-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

const WELCOME_MSG = {
  id: 'welcome',
  from: 'bot',
  text: "Hi 👋 I'm the booking assistant. Type only your name, mobile, and address — everything else is tap-to-select, including doctor and live calendar slots.",
};

export default function ConsultationChatbot({ embedded = false, compact = false }) {
  const { currentUser, userProfile, register, adoptPatientProfile, language } = useAuth();
  const navigate = useNavigate();
  const signedInPatient = Boolean(currentUser && userProfile?.role === 'patient');
  const [chatLanguage, setChatLanguage] = useState(signedInPatient ? language : null);
  const tamil = chatLanguage === 'ta';
  const prompts = tamil ? {
    name: 'ஆலோசனையை முன்பதிவு செய்ய தொடங்கலாம். முதலில் உங்கள் முழுப் பெயர் என்ன?', mobile: 'நன்றி! உங்களைத் தொடர்புகொள்ள எந்த மொபைல் எண்ணைப் பயன்படுத்தலாம்?', age: 'நோயாளியின் வயது என்ன?', whatsapp: 'முன்பதிவு விவரங்களைப் பெற வேண்டிய வாட்ஸ்அப் எண் என்ன?', address: 'சரி. உங்கள் முகவரி என்ன?', password: 'உங்கள் புதிய நோயாளர் கணக்கிற்கான கடவுச்சொல்லை உருவாக்கவும்.', confirmPassword: 'புதிய கணக்கின் கடவுச்சொல்லை உறுதிப்படுத்தவும்.', profile: 'இந்த மொபைலில் பல குடும்ப சுயவிவரங்கள் உள்ளன. இந்த ஆலோசனை யாருக்காக?', consultationType: 'மருத்துவரை எவ்வாறு அணுக விரும்புகிறீர்கள்?', healthConcern: 'நீங்கள் விவாதிக்க விரும்பும் முக்கிய உடல்நலப் பிரச்சினை என்ன?', doctor: 'உதவக்கூடிய மருத்துவர்கள் இங்கே உள்ளனர். ஒருவரைத் தேர்ந்தெடுக்கவும்.', date: 'உங்களுக்கு ஏற்ற தேதியைத் தேர்ந்தெடுக்கவும். மருத்துவர் பணிபுரியும் நாட்கள் மட்டுமே காட்டப்படும்.', time: 'கிடைக்கும் 15 நிமிட நேரத்தைத் தேர்ந்தெடுக்கவும்.', confirm: 'உங்கள் முன்பதிவை உறுதிப்படுத்துவதற்கு முன் சரிபார்க்கவும்.'
  } : STEP_PROMPTS;
  const welcome = { ...WELCOME_MSG, text: tamil ? 'வணக்கம் 👋 நான் முன்பதிவு உதவியாளர். உங்கள் பெயர், மொபைல் எண் மற்றும் முகவரியை மட்டும் உள்ளிடுங்கள். மருத்துவர் மற்றும் காலண்டர் நேரங்கள் உட்பட மற்றவை தேர்வு செய்யலாம்.' : WELCOME_MSG.text };
  const consultationLabels = tamil ? { 'In-Clinic Visit': ['நேரடி மருத்துவமனை வருகை', 'மருத்துவமனைக்கு நேரில் வருகை'], 'Video Consultation': ['காணொளி ஆலோசனை', 'வீட்டிலிருந்து காணொளி மூலம் ஆலோசனை'], 'Phone Consultation': ['தொலைபேசி ஆலோசனை', 'எளிய தொலைபேசி ஆலோசனை'] } : {};
  const concernLabels = tamil ? { 'Diabetes Care': 'நீரிழிவு பராமரிப்பு', 'Thyroid Issues': 'தைராய்டு பிரச்சினைகள்', 'Weight Management': 'எடை மேலாண்மை', "Women's Wellness": 'பெண்கள் நலவாழ்வு', 'Stress / Anxiety': 'மனஅழுத்தம் / பதற்றம்', 'Breathing / Respiratory': 'சுவாசம் / சுவாசக் கோளாறு', 'Joint & Arthritis Pain': 'மூட்டு மற்றும் மூட்டுவலி', 'Skin Care': 'சரும பராமரிப்பு', "Children's Health": 'குழந்தைகள் உடல்நலம்', 'Diet & Nutrition': 'உணவு மற்றும் ஊட்டச்சத்து', 'General Consultation': 'பொதுவான ஆலோசனை' } : {};
  const ui = tamil ? { title: 'ஆலோசனையை முன்பதிவு செய்க', slots: '15 நிமிட நேரங்கள் · Google Calendar', back: 'பின்னால்', recommended: 'பரிந்துரைக்கப்படுகிறது', noSlots: 'இந்த தேதியில் 15 நிமிட நேரங்கள் இல்லை. பின்னால் சென்று வேறு நாளைத் தேர்ந்தெடுக்கவும்.', name: 'பெயர்', mobile: 'மொபைல் / வாட்ஸ்அப்', age: 'வயது', address: 'முகவரி', consultation: 'ஆலோசனை', concern: 'உடல்நலப் பிரச்சினை', doctor: 'மருத்துவர்', date: 'தேதி', time: 'நேரம்', confirm: 'முன்பதிவை உறுதிப்படுத்துக', booking: 'முன்பதிவு செய்கிறது...', requested: 'ஆலோசனை கோரப்பட்டது!', calendar: 'Google Calendar-ல் சேர்க்கவும்', blocked: 'இந்த 15 நிமிட நேரம் மற்ற நோயாளிகளுக்கு தடுக்கப்பட்டுள்ளது.', send: 'அனுப்புக', addressPlaceholder: 'உங்கள் முகவரி', mobilePlaceholder: '10 இலக்க மொபைல் எண்', agePlaceholder: 'நோயாளியின் வயது', passwordPlaceholder: 'புதிய கடவுச்சொல்', confirmPasswordPlaceholder: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்', namePlaceholder: 'உங்கள் முழுப் பெயர்' } : { title: 'Book a Consultation', slots: '15-min slots · Google Calendar', back: 'Go back', recommended: 'Recommended', noSlots: 'No 15-minute slots left on this date — go back and pick another day.', name: 'Name', mobile: 'Mobile / WhatsApp', age: 'Age', address: 'Address', consultation: 'Consultation', concern: 'Concern', doctor: 'Doctor', date: 'Date', time: 'Time', confirm: 'Confirm Booking', booking: 'Booking...', requested: 'Appointment Requested!', calendar: 'Add to Google Calendar', blocked: 'This 15-minute window is now blocked for other patients.', send: 'Send', addressPlaceholder: 'Your address', mobilePlaceholder: '10-digit mobile number', agePlaceholder: 'Patient age', passwordPlaceholder: 'New password', confirmPasswordPlaceholder: 'Confirm password', namePlaceholder: 'Your full name' };
  const firstBookingStep = signedInPatient ? STEPS.indexOf('consultationType') : 0;
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState(signedInPatient ? [welcome, { id: 'p-name', from: 'bot', text: prompts.name }] : [{ id: 'language-choice', from: 'bot', text: 'Choose your language / மொழியைத் தேர்ந்தெடுக்கவும்' }]);
  const [form, setForm] = useState({
    name: userProfile?.name || '',
    mobile: userProfile?.phone || '',
    age: userProfile?.age || '',
    whatsapp: userProfile?.whatsapp || userProfile?.phone || '',
    sameWhatsapp: true,
    address: userProfile?.address || '',
    password: '',
    confirmPassword: '',
    patientId: userProfile?.patientId || '',
    consultationType: null,
    healthConcern: null,
    doctorId: null,
    date: '',
    time: '',
  });
  const [textInput, setTextInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [calendarLink, setCalendarLink] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('sending');
  const [notificationError, setNotificationError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => subscribeAppointments(setAppointments), []);

  useEffect(() => {
    if (!signedInPatient || stepIdx !== 0) return;
    setChatLanguage(language);
    setForm((current) => ({
      ...current,
      name: userProfile.name || current.name,
      mobile: userProfile.phone || current.mobile,
      whatsapp: userProfile.whatsapp || userProfile.phone || current.whatsapp,
      age: userProfile.age || current.age,
      address: userProfile.address || current.address,
      patientId: userProfile.patientId || current.patientId,
    }));
    setStepIdx(firstBookingStep);
    setMessages([welcome, { id: `p-signed-in-${Date.now()}`, from: 'bot', text: tamil ? `மீண்டும் வரவேற்கிறோம், ${userProfile.name}. உங்கள் நோயாளர் விவரங்கள் ஏற்கனவே ஏற்றப்பட்டுள்ளன. தொடர ஆலோசனை வகையைத் தேர்ந்தெடுக்கவும்.` : `Welcome back, ${userProfile.name}. Your patient details are already loaded. Choose a consultation type to continue.` }]);
  }, [signedInPatient, userProfile, firstBookingStep, stepIdx]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, stepIdx]);

  const step = STEPS[stepIdx];
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId) || null;
  const openSlots = selectedDoctor && form.date ? remainingSlots(selectedDoctor, form.date, appointments) : [];
  const bookingPatientId = form.patientId || userProfile?.patientId || currentUser?.patientId || findUserByPhone(form.mobile)?.patientId;

  function pushMessage(msg) {
    setMessages((m) => [...m, { id: `${Date.now()}-${Math.random()}`, ...msg }]);
  }

  function chooseChatLanguage(nextLanguage) {
    const nextTamil = nextLanguage === 'ta';
    setChatLanguage(nextLanguage);
    setMessages([
      { ...WELCOME_MSG, text: nextTamil ? 'வணக்கம் 👋 நான் முன்பதிவு உதவியாளர். உங்கள் பெயர், மொபைல் எண் மற்றும் முகவரியை மட்டும் உள்ளிடுங்கள். மருத்துவர் மற்றும் காலண்டர் நேரங்கள் உட்பட மற்றவை தேர்வு செய்யலாம்.' : WELCOME_MSG.text },
      { id: `p-language-${Date.now()}`, from: 'bot', text: nextTamil ? 'ஆலோசனையை முன்பதிவு செய்ய தொடங்கலாம். முதலில் உங்கள் முழுப் பெயர் என்ன?' : STEP_PROMPTS.name },
    ]);
  }

  function goToStep(index) {
    setError('');
    setStepIdx(index);
    const key = STEPS[index];
    if (prompts[key]) pushMessage({ from: 'bot', text: prompts[key] });
  }

  function advance(updates, userSummaryText, nextStep = stepIdx + 1) {
    setForm((f) => ({ ...f, ...updates }));
    if (userSummaryText) pushMessage({ from: 'user', text: userSummaryText });
    const next = nextStep;
    setStepIdx(next);
    const key = STEPS[next];
    if (key === 'confirm') {
      pushMessage({ from: 'bot', text: prompts.confirm, kind: 'summary' });
    } else if (prompts[key]) {
      pushMessage({ from: 'bot', text: prompts[key] });
    }
  }

  function handleTextSubmit(e) {
    e.preventDefault();
    const value = textInput.trim();
    setError('');
    if (step === 'name') {
      if (value.length < 2) return setError(tamil ? 'உங்கள் முழுப் பெயரை உள்ளிடவும்.' : 'Please enter your full name.');
      setTextInput('');
      advance({ name: value }, value);
      return;
    }
    if (step === 'age') {
      if (!/^\d{1,3}$/.test(value) || Number(value) < 1 || Number(value) > 120) return setError(tamil ? 'சரியான வயதை உள்ளிடவும்.' : 'Enter a valid age.');
      setTextInput('');
      advance({ age: value }, value);
      return;
    }
    if (step === 'mobile' || step === 'whatsapp') {
      const digits = value.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(digits)) return setError(tamil ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.' : 'Enter a valid 10-digit mobile number.');
      setTextInput('');
      if (step === 'mobile') {
        const profiles = findUsersByPhone(digits);
        const existing = profiles[0];
        if (existing) {
          setForm((current) => ({ ...current, mobile: digits, whatsapp: existing.whatsapp || digits, name: '', age: '', address: '', patientId: '' }));
          pushMessage({ from: 'user', text: digits });
          pushMessage({ from: 'bot', text: prompts.profile });
          setStepIdx(STEPS.indexOf('profile'));
          return;
        }
      }
      advance(step === 'mobile' ? { mobile: digits, whatsapp: digits } : { whatsapp: digits }, digits);
      return;
    }
    if (step === 'address') {
      if (value.length < 8) return setError(tamil ? 'முழுமையான முகவரியைப் பகிரவும்.' : 'Please share a more complete address.');
      setTextInput('');
      advance({ address: value }, value);
      return;
    }
    if (step === 'profile') {
      const profile = findUsersByPhone(form.mobile).find((item) => item.name?.toLowerCase() === value.toLowerCase());
      if (!profile) return setError(tamil ? 'குடும்ப சுயவிவரத்தைத் தேர்ந்தெடுக்கவும் அல்லது சரியான பெயரை உள்ளிடவும்.' : 'Choose one of the family profiles or enter an exact profile name.');
      setTextInput('');
      selectFamilyProfile(profile);
      return;
    }
    if (step === 'password') {
      if (value.length < 6) return setError(tamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.' : 'Password must be at least 6 characters.');
      setTextInput('');
      advance({ password: value }, 'Password created');
      return;
    }
    if (step === 'confirmPassword') {
      if (value !== form.password) return setError(tamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.');
      setTextInput('');
      const hasExistingProfiles = findUsersByPhone(form.mobile).length > 0;
      advance({ confirmPassword: value }, 'Password confirmed', hasExistingProfiles ? STEPS.indexOf('profile') : STEPS.indexOf('consultationType'));
    }
  }

  function selectDate(dateStr) {
    if (!isDoctorAvailableOn(selectedDoctor, dateStr)) {
      setError(tamil ? `இந்த நாளில் ${selectedDoctor.name} கிடைக்கவில்லை.` : `${selectedDoctor.name} is not available on this day.`);
      return;
    }
    if (patientHasBookingOnDate(appointments, { patientId: bookingPatientId, phone: form.mobile, date: dateStr })) {
      setError(tamil ? 'இந்த நோயாளிக்கு இந்த தேதியில் ஏற்கனவே ஆலோசனை உள்ளது. வேறு தேதியைத் தேர்ந்தெடுக்கவும்.' : 'This patient already has a consultation on this date. Choose another date.');
      return;
    }
    advance({ date: dateStr, time: '' }, formatDateLabel(dateStr, language));
  }

  function selectFamilyProfile(profile) {
    adoptPatientProfile(profile);
    setForm((current) => ({ ...current, patientId: profile.patientId, name: profile.name, age: profile.age || '', address: profile.address || '', whatsapp: profile.whatsapp || form.mobile }));
    pushMessage({ from: 'user', text: `${profile.name} · Patient ID ${profile.patientId}` });
    setStepIdx(STEPS.indexOf('consultationType'));
    pushMessage({ from: 'bot', text: prompts.consultationType });
  }

  function continueWithPrimaryProfile() {
    const profile = findUsersByPhone(form.mobile)[0];
    if (profile) {
      selectFamilyProfile(profile);
      return;
    }
    advance({ patientId: '' }, form.name);
  }

  function selectTime(t) {
    if (!remainingSlots(selectedDoctor, form.date, appointments).includes(t)) {
      setError(tamil ? 'அந்த நேரம் இப்போது முன்பதிவு செய்யப்பட்டது. வேறு நேரத்தைத் தேர்ந்தெடுக்கவும்.' : 'That slot was just booked. Pick another time.');
      return;
    }
    advance({ time: t }, `${t} (15 minutes)`);
  }

  function editField(targetKey) {
    const idx = STEPS.indexOf(targetKey);
    if (idx === -1) return;
    setError('');
    pushMessage({ from: 'user', text: `Edit ${targetKey}` });
    setStepIdx(idx);
    pushMessage({ from: 'bot', text: prompts[targetKey] });
  }

  async function confirmBooking() {
    setSaving(true);
    setError('');
    let createdAccount = false;
    if (!remainingSlots(selectedDoctor, form.date, appointments).includes(form.time)) {
      setSaving(false);
      setError(tamil ? 'இந்த 15 நிமிட நேரம் இனி கிடைக்கவில்லை.' : 'This 15-minute slot is no longer available.');
      return;
    }
    if (patientHasBookingOnDate(appointments, { patientId: bookingPatientId, phone: form.mobile, date: form.date })) {
      setError(tamil ? 'இந்த நோயாளிக்கு இந்த தேதியில் ஏற்கனவே ஆலோசனை உள்ளது. வேறு தேதியைத் தேர்ந்தெடுக்கவும்.' : 'This patient already has a consultation on this date. Choose another date.');
      return;
    }
    const ref = genRef();
    let patientId = form.patientId || currentUser?.patientId || userProfile?.patientId;
    if (!patientId && form.mobile) {
      const existing = findUserByPhone(form.mobile);
      if (existing) {
        patientId = existing.patientId;
        adoptPatientProfile(existing);
      }
      if (!patientId) {
        try {
          const account = await register({ name: form.name, age: form.age, phone: form.mobile, whatsapp: form.whatsapp, address: form.address, password: form.password });
          patientId = account?.patientId;
          createdAccount = Boolean(patientId);
        } catch (accountError) {
          const existingAfterAttempt = findUserByPhone(form.mobile);
          patientId = existingAfterAttempt?.patientId;
        }
      }
    }
    const concern = healthConcerns.find((h) => h.tag === form.healthConcern)?.label || form.healthConcern;
    const cal = googleCalendarUrl({
      title: `Consultation with ${selectedDoctor.name}`,
      date: form.date,
      time: form.time,
      durationMin: 15,
      details: `${concern} · ${consultationTypes.find((c) => c.id === form.consultationType)?.label} · Ref ${ref}`,
    });
    const accountMessage = `Dr. Srilakshmi Clinic booking ${ref}. Patient ID: ${patientId || 'your account'}. Login username: ${form.mobile}. ${form.password ? `Initial password: ${form.password}. ` : ''}${selectedDoctor.name} on ${form.date} at ${form.time}.`;
    const whatsapp = `https://wa.me/${form.whatsapp}?text=${encodeURIComponent(accountMessage)}`;
    try {
      await createAppointment({
        name: form.name,
        phone: form.mobile,
        whatsapp: form.whatsapp,
        age: form.age,
        address: form.address,
        consultationType: form.consultationType,
        healthConcern: concern,
        program: concern,
        doctorId: form.doctorId,
        doctorName: selectedDoctor?.name || '',
        date: form.date,
        time: form.time,
        durationMin: 15,
        bookingRef: ref,
        patientId: patientId || currentUser?.uid || null,
        status: 'pending',
        source: 'chatbot',
        calendarUrl: cal,
        notificationMessage: accountMessage,
        whatsappUrl: whatsapp,
      });
      try {
        const notification = await sendBookingNotification({ mobile: form.mobile, whatsapp: form.whatsapp, message: accountMessage, contentVariables: { 1: form.date, 2: form.time } });
        const liveSent = notification.results?.some((result) => result.status === 'sent');
        const failed = notification.results?.find((result) => result.status === 'failed');
        setNotificationStatus(liveSent ? 'sent' : failed ? 'failed' : 'demo');
        setNotificationError(failed?.error || '');
      } catch (notificationError) {
        console.warn('Booking saved, but notification delivery was unavailable:', notificationError.message);
        setNotificationStatus('unavailable');
        setNotificationError(notificationError.message);
      }
    } catch (err) {
      console.error('Booking save failed:', err);
    } finally {
      setCalendarLink(cal);
      setBookingRef(ref);
      setSaving(false);
      pushMessage({ from: 'bot', text: `You're all set! Slot reserved for 15 minutes. Reference: ${ref}`, kind: 'success' });
      setStepIdx(STEPS.indexOf('done'));
      if (createdAccount) navigate('/dashboard/patient');
    }
  }

  function restart() {
    setForm({
      name: userProfile?.name || '',
      mobile: userProfile?.phone || '',
      age: userProfile?.age || '',
      whatsapp: userProfile?.whatsapp || userProfile?.phone || '',
      sameWhatsapp: true,
      address: userProfile?.address || '',
      consultationType: null,
      healthConcern: null,
      doctorId: null,
      date: '',
      time: '',
    });
    setTextInput('');
    setError('');
    setBookingRef('');
    setCalendarLink('');
    setNotificationStatus('sending');
    setNotificationError('');
    setMessages([welcome, { id: 'p-start-' + Date.now(), from: 'bot', text: signedInPatient ? (tamil ? `மீண்டும் வரவேற்கிறோம், ${userProfile?.name}. தொடர ஆலோசனை வகையைத் தேர்ந்தெடுக்கவும்.` : `Welcome back, ${userProfile?.name}. Choose a consultation type to continue.`) : prompts.name }]);
    setStepIdx(firstBookingStep);
  }

  const showBack = stepIdx > 0 && step !== 'done';
  const availableDates = selectedDoctor
    ? nextFourteenDates(tamil ? 'ta-IN' : 'en-IN').filter((d) => isDoctorAvailableOn(selectedDoctor, d.iso) && !patientHasBookingOnDate(appointments, { patientId: bookingPatientId, phone: form.mobile, date: d.iso }))
    : [];

  return (
    <div className={`flex flex-col ${compact ? 'h-full min-h-0' : embedded ? 'h-[720px]' : 'h-full'} bg-white`}>
      <div className="bg-primary text-white px-5 py-4 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Stethoscope size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sm leading-tight">{ui.title}</p>
          <p className="text-xs text-white/75 leading-tight">{ui.slots}</p>
        </div>
        {showBack && (
          <button type="button" onClick={() => goToStep(Math.max(0, stepIdx - 1))} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center" aria-label={ui.back}>
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {step !== 'done' && (
        <div className="h-1 bg-secondary/20 shrink-0">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(stepIdx / (STEPS.length - 1)) * 100}%` }} />
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 py-4 space-y-3 bg-bg">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.from === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : m.kind === 'success'
                ? 'bg-primary-dark text-white rounded-bl-sm'
                : 'bg-white text-ink border-2 border-primary/25 rounded-bl-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {!signedInPatient && !chatLanguage && (
          <div className="grid gap-2 pt-1">
            <button type="button" onClick={() => chooseChatLanguage('ta')} className="rounded-xl border-2 border-primary/25 bg-white px-4 py-3 text-left text-sm font-semibold hover:border-primary hover:bg-primary/5">தமிழ்</button>
            <button type="button" onClick={() => chooseChatLanguage('en')} className="rounded-xl border-2 border-primary/25 bg-white px-4 py-3 text-left text-sm font-semibold hover:border-primary hover:bg-primary/5">English</button>
          </div>
        )}

        {step === 'consultationType' && (
          <div className="grid gap-2 pt-1">
            {consultationTypes.map((ct) => {
              const Icon = ICONS[ct.icon] || Stethoscope;
              return (
                <button key={ct.id} onClick={() => advance({ consultationType: ct.id }, consultationLabels[ct.label]?.[0] || ct.label)} className="flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 border-primary/25 bg-white hover:border-primary hover:bg-primary/5">
                  <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon size={18} /></span>
                  <span>
                    <span className="block text-sm font-semibold">{consultationLabels[ct.label]?.[0] || ct.label}</span>
                    <span className="block text-xs text-muted">{consultationLabels[ct.label]?.[1] || ct.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 'healthConcern' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {healthConcerns.map((hc) => {
              const Icon = ICONS[hc.icon] || Stethoscope;
              return (
                <button key={hc.tag} onClick={() => advance({ healthConcern: hc.tag, doctorId: null }, concernLabels[hc.label] || hc.label)} className="flex flex-col items-start gap-2 text-left px-3 py-3 rounded-xl border-2 border-primary/25 bg-white hover:border-primary">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Icon size={16} /></span>
                  <span className="text-xs font-semibold leading-tight">{concernLabels[hc.label] || hc.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === 'profile' && (
          <div className="grid gap-2 pt-1">
            <label className="text-xs font-semibold text-primary-dark" htmlFor="family-profile">{tamil ? 'குடும்ப உறுப்பினரைத் தேர்ந்தெடுக்கவும்' : 'Select family member'}</label>
            <select id="family-profile" className="input" defaultValue="" onChange={(event) => { const profile = findUsersByPhone(form.mobile).find((item) => (item.patientId || item.uid) === event.target.value); if (profile) selectFamilyProfile(profile); }}>
              <option value="">{tamil ? 'குடும்ப உறுப்பினரைத் தேர்ந்தெடுக்கவும்' : 'Choose a family member'}</option>
              {findUsersByPhone(form.mobile).map((profile) => <option key={profile.patientId || profile.uid} value={profile.patientId || profile.uid}>{profile.name} · {tamil ? 'வயது' : 'Age'} {profile.age || '—'} · ID {profile.patientId || '—'}</option>)}
            </select>
            {findUsersByPhone(form.mobile).map((profile) => <button key={profile.patientId || profile.uid} type="button" onClick={() => selectFamilyProfile(profile)} className="flex items-center justify-between rounded-xl border-2 border-primary/25 bg-white px-4 py-3 text-left hover:border-primary hover:bg-primary/5"><span><span className="block text-sm font-semibold">{profile.name}</span><span className="block text-xs text-muted">Age {profile.age || '—'} · Patient ID {profile.patientId || '—'}</span></span><User size={17} className="text-primary" /></button>)}
            <button type="button" onClick={continueWithPrimaryProfile} className="rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 text-left text-sm font-semibold text-primary hover:bg-primary/10">{tamil ? 'மேலே உள்ள விவரங்களுடன் முதன்மை சுயவிவரத்தைத் தொடரவும்' : 'Continue with the primary profile using the details above'}</button>
          </div>
        )}

        {step === 'doctor' && (
          <div className="grid gap-3 pt-1">
            {[...doctors]
              .sort((a, b) => (a.tags.includes(form.healthConcern) ? 0 : 1) - (b.tags.includes(form.healthConcern) ? 0 : 1))
              .map((doc) => {
                const recommended = doc.tags.includes(form.healthConcern);
                return (
                  <button key={doc.id} onClick={() => advance({ doctorId: doc.id, date: '', time: '' }, `${doc.name} (${doc.specialization})`)} className="flex gap-3 text-left p-3 rounded-xl border-2 border-primary/25 bg-white hover:border-primary relative">
                    {recommended && <span className="absolute top-2 right-2 text-[10px] font-semibold bg-gold/15 text-gold px-2 py-0.5 rounded-full">{ui.recommended}</span>}
                    <img src={doc.photo} alt={doc.name} className="w-14 h-14 rounded-full object-cover shrink-0 img-stroke" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{doc.name}</p>
                      <p className="text-xs text-primary font-medium">{doc.specialization}</p>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-1"><Award size={12} /> {doc.experience} · {doc.qualification}</p>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-1"><Clock3 size={12} /> {doc.hours} · 15 min slots</p>
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {step === 'date' && selectedDoctor && (
          <div className="pt-1 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted">
              <CalendarDays size={14} /> {selectedDoctor.workingDays.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableDates.map((d) => (
                <button key={d.iso} type="button" onClick={() => selectDate(d.iso)} className="px-3 py-2.5 rounded-xl border-2 border-primary/25 bg-white text-xs font-semibold hover:border-primary">
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'time' && selectedDoctor && form.date && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {openSlots.length === 0 && (
              <p className="col-span-3 text-xs text-muted">{ui.noSlots}</p>
            )}
            {openSlots.map((t) => (
              <button key={t} onClick={() => selectTime(t)} className="px-2 py-2.5 rounded-lg border-2 border-primary/30 bg-white text-xs font-semibold hover:border-primary hover:bg-primary/5">
                {t}
              </button>
            ))}
          </div>
        )}

        {step === 'confirm' && selectedDoctor && (
          <div className="pt-1">
            <div className="card-outline p-4 space-y-2.5 text-sm">
              <SummaryRow icon={User} label={ui.name} value={form.name} onEdit={() => editField('name')} />
              <SummaryRow icon={Phone} label={ui.mobile} value={`${form.mobile} / ${form.whatsapp}`} onEdit={() => editField('mobile')} />
              <SummaryRow icon={User} label={ui.age} value={form.age} onEdit={() => editField('age')} />
              <SummaryRow icon={MapPin} label={ui.address} value={form.address} onEdit={() => editField('address')} />
              <SummaryRow icon={Building2} label={ui.consultation} value={consultationLabels[consultationTypes.find((c) => c.id === form.consultationType)?.label]?.[0] || consultationTypes.find((c) => c.id === form.consultationType)?.label} onEdit={() => editField('consultationType')} />
              <SummaryRow icon={Stethoscope} label={ui.concern} value={concernLabels[healthConcerns.find((h) => h.tag === form.healthConcern)?.label] || healthConcerns.find((h) => h.tag === form.healthConcern)?.label} onEdit={() => editField('healthConcern')} />
              <SummaryRow icon={User} label={ui.doctor} value={`${selectedDoctor.name} · ${selectedDoctor.specialization}`} onEdit={() => editField('doctor')} />
              <SummaryRow icon={CalendarDays} label={ui.date} value={formatDateLabel(form.date, language)} onEdit={() => editField('date')} />
              <SummaryRow icon={Clock3} label={ui.time} value={`${form.time} (15 min)`} onEdit={() => editField('time')} />
            </div>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            <button type="button" className="btn btn-primary w-full mt-3" onClick={confirmBooking} disabled={saving}>
              <CheckCircle2 size={16} /> {saving ? ui.booking : ui.confirm}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="pt-1 text-center card-outline p-5">
            <CheckCircle2 className="text-primary mx-auto mb-2" size={40} />
            <p className="font-heading font-bold text-primary-dark">{ui.requested}</p>
            <p className="text-xs text-muted mt-1">Reference: <span className="font-semibold text-ink">{bookingRef}</span></p>
            <p className="text-xs text-muted mt-2">{ui.blocked}</p>
            {calendarLink && (
              <a href={calendarLink} target="_blank" rel="noreferrer" className="btn btn-primary w-full mt-4">
                <ExternalLink size={14} /> {ui.calendar}
              </a>
            )}
            <div className={`mt-3 rounded-xl px-3 py-2 text-xs ${notificationStatus === 'sent' ? 'bg-secondary/15 text-primary-dark' : 'bg-amber-50 text-amber-800'}`}>
              {notificationStatus === 'sent' && 'Booking details, consultation date, time, and credentials were sent automatically by WhatsApp and SMS.'}
              {notificationStatus === 'demo' && 'Booking saved. Notification demo mode is active; start the backend with Twilio credentials for automatic WhatsApp and SMS delivery.'}
              {notificationStatus === 'failed' && `Booking saved, but Twilio could not deliver the notification: ${notificationError}`}
              {notificationStatus === 'unavailable' && 'Booking saved, but the notification service is unavailable. Start the backend and check the Twilio configuration.'}
              {notificationStatus === 'sending' && 'Sending booking details to WhatsApp and SMS...'}
            </div>
            <button type="button" onClick={restart} className="btn btn-outline w-full mt-3">
              <RotateCcw size={14} /> Book another consultation
            </button>
          </div>
        )}
      </div>

      {chatLanguage && (step === 'name' || step === 'age' || step === 'mobile' || step === 'whatsapp' || step === 'address' || step === 'password' || step === 'confirmPassword' || step === 'profile') && (
        <form onSubmit={handleTextSubmit} className="p-3 border-t-2 border-primary/20 bg-white shrink-0">
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <div className="flex gap-2">
            {step === 'address' ? (
              <textarea
                className="input min-h-[46px] flex-1 resize-none"
                placeholder={ui.addressPlaceholder}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(e); } }}
              />
            ) : (
              <div className="relative flex-1">
                <input
                  className={`input w-full ${step === 'password' || step === 'confirmPassword' ? '!pr-11' : ''}`}
                  inputMode={step === 'mobile' || step === 'whatsapp' || step === 'age' ? 'numeric' : 'text'}
                  type={step === 'password' || step === 'confirmPassword' ? (showPassword ? 'text' : 'password') : step === 'mobile' || step === 'whatsapp' || step === 'age' ? 'tel' : 'text'}
                  placeholder={step === 'profile' ? (tamil ? 'சரியான நோயாளர் பெயரை உள்ளிடவும்' : 'Type the exact patient name') : step === 'mobile' || step === 'whatsapp' ? ui.mobilePlaceholder : step === 'age' ? ui.agePlaceholder : step === 'password' ? ui.passwordPlaceholder : step === 'confirmPassword' ? ui.confirmPasswordPlaceholder : ui.namePlaceholder}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  autoFocus
                />
                {(step === 'password' || step === 'confirmPassword') && <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>}
              </div>
            )}
            <button type="submit" className="btn btn-primary !px-3 self-end" aria-label={ui.send}>
              <Send size={18} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, onEdit }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-primary mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted font-semibold">{label}</p>
        <p className="text-sm text-ink break-words">{value || '—'}</p>
      </div>
      <button type="button" onClick={onEdit} className="text-muted hover:text-primary shrink-0 mt-0.5" aria-label={`Edit ${label}`}>
        <Pencil size={13} />
      </button>
    </div>
  );
}
