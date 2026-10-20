import { generateQuarterHourSlots } from '../lib/slots';

export const doctors = [
  {
    id: 'dr-srilakshmi',
    name: 'Dr. J. Srilakshmi',
    specialization: 'Homeopathy & Chronic Care',
    tags: ['diabetes-care', 'thyroid-care', 'womens-wellness', 'arthritis-care', 'skin-care-program', 'general'],
    experience: '18+ years',
    qualification: 'BHMS, MD (Homeopathy)',
    photo: 'https://randomuser.me/api/portraits/women/65.jpg',
    workingDays: [1, 2, 3, 4, 5, 6],
    hours: '9:00 AM – 6:00 PM',
    start: '09:00',
    end: '18:00',
    slots: generateQuarterHourSlots({ start: '09:00', end: '18:00' }),
  },
  {
    id: 'dr-arvind-menon',
    name: 'Dr. Arvind Menon',
    specialization: 'Medical Yoga & Breathing Therapy',
    tags: ['joy-of-breathing', 'stress-relief-program', 'arthritis-care', 'general'],
    experience: '12+ years',
    qualification: 'M.Sc Yoga Therapy, Certified Pranayama Coach',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    workingDays: [1, 2, 3, 4, 5, 6],
    hours: '7:00 AM – 1:00 PM, 4:00 PM – 7:00 PM',
    slots: [
      ...generateQuarterHourSlots({ start: '07:00', end: '13:00', lunchStart: '00:00', lunchEnd: '00:00' }),
      ...generateQuarterHourSlots({ start: '16:00', end: '19:00', lunchStart: '00:00', lunchEnd: '00:00' }),
    ],
  },
  {
    id: 'dr-kavitha-ramesh',
    name: 'Dr. Kavitha Ramesh',
    specialization: 'Clinical Nutrition & Weight Management',
    tags: ['weight-loss-program', 'nutrition-diet-plans', 'diabetes-care', 'children-wellness', 'general'],
    experience: '9+ years',
    qualification: 'M.Sc Clinical Nutrition, RD',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    workingDays: [1, 2, 3, 4, 5],
    hours: '10:00 AM – 5:00 PM',
    slots: generateQuarterHourSlots({ start: '10:00', end: '17:00' }),
  },
  {
    id: 'dr-naveen-kumar',
    name: 'Dr. Naveen Kumar',
    specialization: "Women's Wellness & Hormonal Health",
    tags: ['womens-wellness', 'thyroid-care', 'skin-care-program', 'general'],
    experience: '14+ years',
    qualification: 'BHMS, Fellowship in Reproductive Health',
    photo: 'https://randomuser.me/api/portraits/men/54.jpg',
    workingDays: [2, 3, 4, 5, 6],
    hours: '11:00 AM – 7:00 PM',
    slots: generateQuarterHourSlots({ start: '11:00', end: '19:00' }),
  },
];

export const healthConcerns = [
  { tag: 'diabetes-care', label: 'Diabetes Care', icon: 'Droplets' },
  { tag: 'thyroid-care', label: 'Thyroid Issues', icon: 'Activity' },
  { tag: 'weight-loss-program', label: 'Weight Management', icon: 'Scale' },
  { tag: 'womens-wellness', label: "Women's Wellness", icon: 'HeartPulse' },
  { tag: 'stress-relief-program', label: 'Stress / Anxiety', icon: 'Flower2' },
  { tag: 'joy-of-breathing', label: 'Breathing / Respiratory', icon: 'Wind' },
  { tag: 'arthritis-care', label: 'Joint & Arthritis Pain', icon: 'Bone' },
  { tag: 'skin-care-program', label: 'Skin Care', icon: 'Sparkles' },
  { tag: 'children-wellness', label: "Children's Health", icon: 'Baby' },
  { tag: 'nutrition-diet-plans', label: 'Diet & Nutrition', icon: 'Salad' },
  { tag: 'general', label: 'General Consultation', icon: 'Stethoscope' },
];

export const consultationTypes = [
  { id: 'in-clinic', label: 'In-Clinic Visit', desc: 'Visit our clinic in person', icon: 'Building2' },
  { id: 'video', label: 'Video Consultation', desc: 'Consult from home over video', icon: 'Video' },
  { id: 'phone', label: 'Phone Consultation', desc: 'A simple phone call consult', icon: 'Phone' },
];

export function isDoctorAvailableOn(doctor, dateStr) {
  if (!doctor || !dateStr) return false;
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return doctor.workingDays.includes(day);
}
