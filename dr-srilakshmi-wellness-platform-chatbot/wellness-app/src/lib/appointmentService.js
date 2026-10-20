import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  addAppointment as addLocal,
  addPrescription as addLocalPrescription,
  getAppointments,
  getPrescriptions,
  getNutritionRequests,
  addNutritionRequest as addLocalNutritionRequest,
  subscribeLocal,
  updateAppointment as updateLocal,
  updatePrescription as updateLocalPrescription,
  updateNutritionRequest as updateLocalNutritionRequest,
  addActivity,
  addInvoice,
  getInvoices,
} from './localDb';

export function subscribeAppointments(callback) {
  if (db) {
    try {
      return onSnapshot(
        collection(db, 'appointments'),
        (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        () => callback(getAppointments())
      );
    } catch {
      // fall through to local
    }
  }
  return subscribeLocal(() => callback(getAppointments()));
}

export async function createAppointment(payload) {
  const local = addLocal(payload);
  addActivity({ patientId: payload.patientId, phone: payload.phone, type: 'booking', title: 'Consultation booked', detail: `${payload.doctorName || 'Doctor'} · ${payload.date} at ${payload.time} · ${payload.consultationType || 'consultation'}` });
  if (db) {
    try {
      await addDoc(collection(db, 'appointments'), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Firestore booking save failed, kept locally:', err);
    }
  }
  return local;
}

export async function setAppointmentStatus(id, status) {
  updateLocal(id, { status });
  const appointment = getAppointments().find((item) => item.id === id);
  if (appointment) addActivity({ patientId: appointment.patientId, phone: appointment.phone, type: 'booking', title: `Appointment ${status}`, detail: `${appointment.date} at ${appointment.time} · ${appointment.doctorName || 'Doctor'}` });
  if (db) {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch {
      // demo / permission
    }
  }
}

export function subscribePrescriptions(callback) {
  return subscribeLocal(() => callback(getPrescriptions()));
}

export async function createPrescription(payload) {
  const appointment = getAppointments().find((item) => item.patientId === payload.patientId && item.date === payload.consultationDate && item.doctorId === payload.doctorId);
  const items = payload.items?.length ? payload.items : [{ medicine: payload.medicine, quantity: payload.quantity || '', dosage: payload.dosage || '', instructions: payload.instructions || '' }];
  const local = addLocalPrescription({ ...payload, items, medicine: items.map((item) => item.medicine).filter(Boolean).join(', '), dosage: items.map((item) => item.dosage || item.instructions).filter(Boolean).join(' · '), appointmentDetails: payload.appointmentDetails || appointment });
  addActivity({ patientId: payload.patientId, phone: payload.patientPhone, type: 'prescription', title: 'Prescription issued', detail: `${items.map((item) => item.medicine).join(', ')}${payload.consultationDate ? ` · Consultation ${payload.consultationDate}` : ''}` });
  if (db) {
    try {
      await addDoc(collection(db, 'prescriptions'), { ...payload, createdAt: serverTimestamp() });
    } catch (err) {
      console.error('Firestore prescription save failed, kept locally:', err);
    }
  }
  return local;
}

export async function markPrescriptionReceived(id) {
  const prescription = getPrescriptions().find((item) => item.id === id);
  updateLocalPrescription(id, { tabletsReceived: true, tabletsReceivedAt: Date.now() });
  if (prescription && !getInvoices().some((invoice) => invoice.prescriptionId === id)) {
    addInvoice({ prescriptionId: id, patientId: prescription.patientId, patientName: prescription.patientName, patientAge: prescription.patientAge, doctorName: prescription.doctorName, doctorId: prescription.doctorId, patientPhone: prescription.patientPhone, consultationDate: prescription.consultationDate, appointmentDetails: prescription.appointmentDetails, items: prescription.items || [{ medicine: prescription.medicine, dosage: prescription.dosage }] });
  }
  if (db) {
    try { await updateDoc(doc(db, 'prescriptions', id), { tabletsReceived: true }); } catch { /* demo / permission */ }
  }
}

export function subscribeInvoices(callback) {
  return subscribeLocal(() => callback(getInvoices()));
}

export function subscribeNutritionRequests(callback) {
  return subscribeLocal(() => callback(getNutritionRequests()));
}

export async function createNutritionRequest(payload) {
  const local = addLocalNutritionRequest(payload);
  addActivity({ patientId: payload.patientId, phone: payload.patientPhone, type: 'nutrition', title: 'Nutrition plan requested', detail: `${payload.planName} · ${payload.consultationDate || ''} ${payload.consultationTime || ''}` });
  if (db) {
    try { await addDoc(collection(db, 'nutritionRequests'), { ...payload, createdAt: serverTimestamp() }); } catch (err) { console.error('Nutrition request save failed, kept locally:', err); }
  }
  return local;
}

export async function setNutritionRequestStatus(id, status) {
  updateLocalNutritionRequest(id, { status, activeAt: status === 'active' ? Date.now() : undefined });
  const request = getNutritionRequests().find((item) => item.id === id);
  if (request) addActivity({ patientId: request.patientId, phone: request.patientPhone, type: 'nutrition', title: `Nutrition plan ${status}`, detail: `${request.planName} · ${request.consultationDate || ''} ${request.consultationTime || ''}` });
  if (db) {
    try { await updateDoc(doc(db, 'nutritionRequests', id), { status, activeAt: status === 'active' ? serverTimestamp() : null }); } catch { /* demo / permission */ }
  }
}
