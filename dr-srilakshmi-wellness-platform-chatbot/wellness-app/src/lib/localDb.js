const KEYS = {
  users: 'dsw_users',
  appointments: 'dsw_appointments',
  journal: 'dsw_journal',
  prescriptions: 'dsw_prescriptions',
  invoices: 'dsw_invoices',
  nutritionRequests: 'dsw_nutrition_requests',
  activities: 'dsw_activities',
  session: 'dsw_session',
};

const EVENT = 'dsw-db-change';
const PATIENT_RESET_VERSION = 'dsw-patient-reset-v2';
const STARTUP_SESSION_RESET_VERSION = 'dsw-startup-session-reset-v1';

export const DEMO_PASSWORD = 'Demo@123';

export function createPatientId() {
  const users = load(KEYS.users, []);
  let id = '';
  do id = String(Math.floor(1000 + Math.random() * 9000)); while (users.some((user) => user.patientId === id));
  return id;
}

const seedUsers = [
  { uid: 'doctor-staff', name: 'Dr. J. Srilakshmi', email: 'doctor@clinic.demo', password: DEMO_PASSWORD, role: 'doctor', phone: '9000000002', address: 'Clinic', doctorId: 'dr-srilakshmi' },
  { uid: 'admin-staff', name: 'Clinic Admin', email: 'admin@clinic.demo', password: DEMO_PASSWORD, role: 'admin', phone: '9000000001', address: 'Clinic HQ' },
  { uid: 'reception-staff', name: 'Clinic Reception', email: 'reception@clinic.demo', password: DEMO_PASSWORD, role: 'receptionist', phone: '9000000003', address: 'Clinic desk' },
  { uid: 'worker-staff', name: 'Medical Desk', email: 'worker@clinic.demo', password: DEMO_PASSWORD, role: 'worker', phone: '9000000004', address: 'Clinic floor' },
];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
}

function seedIfNeeded() {
  const users = load(KEYS.users, null);
  if (!users) {
    save(KEYS.users, seedUsers);
  } else {
    const staffByEmail = new Set(users.filter((user) => user.role !== 'patient').map((user) => user.email));
    const missingStaff = seedUsers.filter((user) => !staffByEmail.has(user.email));
    if (missingStaff.length) save(KEYS.users, [...users, ...missingStaff]);
  }
  const appointments = load(KEYS.appointments, null);
  if (!appointments) save(KEYS.appointments, []);
  if (!load(KEYS.journal, null)) save(KEYS.journal, []);
  if (!load(KEYS.prescriptions, null)) save(KEYS.prescriptions, []);
  if (!load(KEYS.invoices, null)) save(KEYS.invoices, []);
  if (!load(KEYS.nutritionRequests, null)) save(KEYS.nutritionRequests, []);
  if (!load(KEYS.activities, null)) save(KEYS.activities, []);
}

seedIfNeeded();

function resetPatientDataOnce() {
  if (localStorage.getItem(PATIENT_RESET_VERSION)) return;
  save(KEYS.users, getUsers().filter((user) => user.role !== 'patient'));
  save(KEYS.appointments, []);
  save(KEYS.journal, []);
  save(KEYS.prescriptions, []);
  save(KEYS.nutritionRequests, []);
  save(KEYS.activities, []);
  save(KEYS.invoices, []);
  const session = getSession();
  if (session?.role === 'patient') clearSession();
  localStorage.setItem(PATIENT_RESET_VERSION, 'completed');
}

resetPatientDataOnce();

function resetStaleSessionOnce() {
  if (localStorage.getItem(STARTUP_SESSION_RESET_VERSION)) return;
  clearSession();
  localStorage.setItem(STARTUP_SESSION_RESET_VERSION, 'completed');
}

resetStaleSessionOnce();

export function subscribeLocal(cb) {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  cb();
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getUsers() {
  return load(KEYS.users, []);
}

export function upsertUser(user) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.uid === user.uid || u.email === user.email);
  if (idx >= 0) users[idx] = { ...users[idx], ...user };
  else users.push(user);
  save(KEYS.users, users);
  return user;
}

export function removePatient(patient) {
  const patientId = patient.patientId || patient.uid;
  const phone = String(patient.phone || '').replace(/\D/g, '');
  save(KEYS.users, getUsers().filter((user) => user.uid !== patient.uid && user.patientId !== patientId));
  save(KEYS.appointments, getAppointments().filter((item) => item.patientId !== patientId && String(item.phone || '').replace(/\D/g, '') !== phone));
  save(KEYS.journal, getJournal().filter((item) => item.patientId !== patientId));
  save(KEYS.prescriptions, getPrescriptions().filter((item) => item.patientId !== patientId && String(item.patientPhone || '').replace(/\D/g, '') !== phone));
  save(KEYS.nutritionRequests, getNutritionRequests().filter((item) => item.patientId !== patientId && String(item.patientPhone || '').replace(/\D/g, '') !== phone));
  save(KEYS.activities, getActivities().filter((item) => item.patientId !== patientId && String(item.phone || '').replace(/\D/g, '') !== phone));
  save(KEYS.invoices, getInvoices().filter((item) => item.patientId !== patientId && String(item.patientPhone || '').replace(/\D/g, '') !== phone));
}

export function findUserByEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return getUsers().find((u) => String(u.email || '').trim().toLowerCase() === normalizedEmail);
}

export function findUserByPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return getUsers().find((u) => String(u.phone || '').replace(/\D/g, '') === digits);
}

export function findUsersByPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return getUsers().filter((u) => String(u.phone || '').replace(/\D/g, '') === digits);
}

export function getSession() {
  return load(KEYS.session, null);
}

export function setSession(user) {
  const safe = { ...user };
  delete safe.password;
  save(KEYS.session, safe);
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { key: KEYS.session } }));
}

export function getAppointments() {
  return load(KEYS.appointments, []);
}

export function addAppointment(record) {
  const rows = getAppointments();
  const next = { id: record.id || `apt-${Date.now()}`, ...record, createdAt: Date.now() };
  rows.unshift(next);
  save(KEYS.appointments, rows);
  return next;
}

export function updateAppointment(id, patch) {
  const rows = getAppointments().map((r) => (r.id === id ? { ...r, ...patch } : r));
  save(KEYS.appointments, rows);
}

export function getJournal() {
  return load(KEYS.journal, []);
}

export function addJournalEntry(entry) {
  const rows = getJournal();
  rows.unshift({ id: `j-${Date.now()}`, ...entry, createdAt: Date.now() });
  save(KEYS.journal, rows);
}

export function getPrescriptions() {
  return load(KEYS.prescriptions, []);
}

export function addPrescription(record) {
  const rows = getPrescriptions();
  const next = { id: record.id || `rx-${Date.now()}`, ...record, createdAt: Date.now() };
  rows.unshift(next);
  save(KEYS.prescriptions, rows);
  return next;
}

export function updatePrescription(id, patch) {
  const rows = getPrescriptions().map((item) => item.id === id ? { ...item, ...patch } : item);
  save(KEYS.prescriptions, rows);
}

export function getInvoices() { return load(KEYS.invoices, []); }
export function addInvoice(record) {
  const rows = getInvoices();
  const next = { id: record.id || `invoice-${Date.now()}`, ...record, createdAt: Date.now() };
  rows.unshift(next);
  save(KEYS.invoices, rows);
  return next;
}

export function getNutritionRequests() { return load(KEYS.nutritionRequests, []); }
export function addNutritionRequest(record) {
  const rows = getNutritionRequests();
  const next = { id: record.id || `plan-${Date.now()}`, ...record, createdAt: Date.now() };
  rows.unshift(next);
  save(KEYS.nutritionRequests, rows);
  return next;
}
export function updateNutritionRequest(id, patch) {
  save(KEYS.nutritionRequests, getNutritionRequests().map((item) => item.id === id ? { ...item, ...patch } : item));
}

export function getActivities() { return load(KEYS.activities, []); }
export function addActivity(record) {
  const rows = getActivities();
  const next = { id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...record, createdAt: Date.now() };
  rows.unshift(next);
  save(KEYS.activities, rows);
  return next;
}

export function phoneToEmail(phone) {
  return `${String(phone).replace(/\D/g, '')}@patients.clinic.demo`;
}
