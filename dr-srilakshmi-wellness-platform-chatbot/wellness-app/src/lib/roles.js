export const ROLES = {
  patient: 'patient',
  doctor: 'doctor',
  admin: 'admin',
  receptionist: 'receptionist',
  worker: 'worker',
};

export const ROLE_LABELS = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
  receptionist: 'Receptionist',
  worker: 'Worker',
};

export const LOGIN_ROLES = ['patient', 'doctor', 'admin', 'receptionist', 'worker'];
export const STAFF_ROLES = ['doctor', 'admin', 'receptionist', 'worker'];
export const PROMOTABLE_ROLES = ['worker', 'receptionist', 'doctor', 'admin'];

export function dashboardPath(role) {
  return `/dashboard/${role || 'patient'}`;
}

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role);
}
