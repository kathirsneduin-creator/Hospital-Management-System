import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, firebaseConfig } from '../firebase/config';
import { dashboardPath } from '../lib/roles';
import {
  clearSession,
  findUserByEmail,
  findUserByPhone,
  getSession,
  getUsers,
  phoneToEmail,
  setSession,
  subscribeLocal,
  upsertUser,
  DEMO_PASSWORD,
  createPatientId,
  addActivity,
  removePatient,
} from '../lib/localDb';

const AuthContext = createContext(null);

const NOT_CONFIGURED_MESSAGE =
  'Firebase is not configured — demo login is active. Use the demo accounts shown on the login page.';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (loading) return;
    const nextTheme = currentUser ? (localStorage.getItem('dsw-theme') || 'light') : 'light';
    const nextLanguage = currentUser ? (localStorage.getItem('dsw-language') || 'en') : 'en';
    setTheme(nextTheme);
    setLanguage(nextLanguage);
    document.documentElement.classList.toggle('theme-dark', nextTheme === 'dark');
    if (!currentUser) {
      localStorage.removeItem('dsw-theme');
      localStorage.removeItem('dsw-language');
    }
    window.dispatchEvent(new Event('dsw-language-change'));
  }, [currentUser, loading]);

  function updateTheme(nextTheme) {
    setTheme(nextTheme);
    localStorage.setItem('dsw-theme', nextTheme);
    document.documentElement.classList.toggle('theme-dark', nextTheme === 'dark');
  }

  function updateLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    localStorage.setItem('dsw-language', nextLanguage);
    window.dispatchEvent(new Event('dsw-language-change'));
  }

  useEffect(() => {
    if (auth) {
      const firebaseStartupReset = 'dsw-firebase-startup-reset-v1';
      if (!localStorage.getItem(firebaseStartupReset)) {
        localStorage.setItem(firebaseStartupReset, 'completed');
        signOut(auth).catch(() => {});
      }
      const unsub = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            setUserProfile(snap.exists() ? snap.data() : { uid: user.uid, email: user.email, name: user.displayName, role: 'patient' });
          } catch {
            setUserProfile({ uid: user.uid, email: user.email, name: user.displayName, role: 'patient' });
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsub;
    }

    const unsub = subscribeLocal(() => {
      const session = getSession();
      setCurrentUser(session);
      setUserProfile(session);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function register({ name, email, password, phone, whatsapp, address, city, gender, age }) {
    setAuthError('');
    const resolvedEmail = email || phoneToEmail(phone);
    const patientId = createPatientId();
    const initialPassword = password || patientId;
    if (auth && db) {
      const cred = await createUserWithEmailAndPassword(auth, resolvedEmail, initialPassword);
      await updateProfile(cred.user, { displayName: name });
      const profile = {
        uid: cred.user.uid,
        name,
        email: resolvedEmail,
        phone: phone || '',
        whatsapp: whatsapp || phone || '',
        age: age || '',
        patientId,
        username: phone,
        address: address || '',
        city: city || '',
        gender: gender || '',
        role: 'patient',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      addActivity({ patientId, phone, type: 'account', title: 'Patient account created', detail: `Patient ID: ${patientId} · Username: ${phone} · Initial password: ${initialPassword}` });
      setUserProfile(profile);
      return cred.user;
    }

    if (findUserByPhone(phone) || findUserByEmail(resolvedEmail)) {
      throw new Error('That mobile number is already registered — try logging in instead.');
    }
    const profile = {
      uid: `p-${Date.now()}`,
      name,
      email: resolvedEmail,
      password: initialPassword,
      phone,
      whatsapp: whatsapp || phone,
      age: age || '',
      patientId,
      username: phone,
      address,
      city,
      gender,
      role: 'patient',
    };
    upsertUser(profile);
    addActivity({ patientId, phone, type: 'account', title: 'Patient account created', detail: `Patient ID: ${patientId} · Username: ${phone} · Initial password: ${initialPassword}` });
    const session = { ...profile };
    delete session.password;
    setSession(session);
    setCurrentUser(session);
    setUserProfile(session);
    return session;
  }

  async function login(emailOrPhone, password) {
    setAuthError('');
    const loginValue = String(emailOrPhone || '').trim();
    const looksLikePhone = /^[6-9]\d{9}$/.test(loginValue.replace(/\D/g, '')) && !loginValue.includes('@');
    const email = looksLikePhone ? phoneToEmail(loginValue) : loginValue.toLowerCase();

    if (auth && db) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const snap = await getDoc(doc(db, 'users', cred.user.uid));
        const profile = snap.exists() ? snap.data() : null;
        setUserProfile(profile);
        return { ...cred.user, role: profile?.role || 'patient' };
      } catch (firebaseError) {
        const localUser = looksLikePhone ? findUserByPhone(loginValue) : findUserByEmail(email);
        if (!localUser || localUser.password !== password) throw firebaseError;
      }
    }

    const user = looksLikePhone ? findUserByPhone(loginValue) : findUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Login failed. Check your email/mobile and password.');
    }
    const session = { ...user };
    delete session.password;
    setSession(session);
    setCurrentUser(session);
    setUserProfile(session);
    return session;
  }

  async function logout() {
    if (auth) await signOut(auth);
    clearSession();
    setCurrentUser(null);
    setUserProfile(null);
  }

  function adoptPatientProfile(profile) {
    if (!profile || profile.role !== 'patient') return null;
    const session = { ...profile };
    delete session.password;
    setSession(session);
    setCurrentUser(session);
    setUserProfile(session);
    return session;
  }

  async function changePassword(currentPassword, password) {
    const session = getSession();
    const localUser = session ? getUsers().find((item) => item.uid === session.uid) : null;
    if (localUser && localUser.password !== currentPassword) throw new Error('Old password is incorrect.');
    if (auth?.currentUser) await updatePassword(auth.currentUser, password);
    if (localUser) {
      upsertUser({ ...localUser, password });
      addActivity({ patientId: localUser.patientId, phone: localUser.phone, type: 'account', title: 'Password changed', detail: 'Your patient account password was updated.' });
    }
    return true;
  }

  function addMobileNumber(phone) {
    const digits = String(phone).replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(digits)) throw new Error('Enter a valid 10-digit mobile number.');
    const existing = findUserByPhone(digits);
    const session = getSession();
    if (existing?.uid === session?.uid && String(existing.phone).replace(/\D/g, '') === digits) return existing;
    if (existing && existing.uid !== session?.uid) throw new Error('This mobile number is already registered.');
    const user = getUsers().find((item) => item.uid === session?.uid);
    if (!user) throw new Error('Patient session not found.');
    const updated = { ...user, phone: digits, username: digits, whatsapp: user.whatsapp || digits };
    upsertUser(updated);
    adoptPatientProfile(updated);
    addActivity({ patientId: updated.patientId, phone: digits, type: 'account', title: 'Mobile number added', detail: `New login mobile: ${digits}` });
    return updated;
  }

  async function addFamilyMember({ name, age, phone, address, whatsapp }) {
    const owner = getSession();
    const digits = String(phone || owner?.phone || '').replace(/\D/g, '');
    if (!name || !age || !/^[6-9]\d{9}$/.test(digits)) throw new Error('Name, age, and a valid mobile number are required.');
    const profile = { uid: `p-${Date.now()}`, name, age, phone: digits, whatsapp: whatsapp || digits, address: address || owner?.address || '', patientId: createPatientId(), username: digits, role: 'patient', familyOwnerId: owner?.uid };
    upsertUser({ ...profile, password: profile.patientId });
    addActivity({ patientId: profile.patientId, phone: digits, type: 'account', title: 'Family member added', detail: `${name} · Patient ID ${profile.patientId}` });
    return profile;
  }

  function updateFamilyMemberMobile(memberId, phone) {
    return updateFamilyMemberDetails(memberId, { phone });
  }

  function updateFamilyMemberDetails(memberId, { name, age, phone, address, whatsapp }) {
    const owner = getSession();
    const digits = String(phone).replace(/\D/g, '');
    if (!owner || !name || !age || !/^[6-9]\d{9}$/.test(digits)) throw new Error('Name, age, and a valid mobile number are required.');
    const member = getUsers().find((item) => item.uid === memberId && item.familyOwnerId === owner.uid);
    if (!member) throw new Error('Family member was not found in this account.');
    const existing = findUserByPhone(digits);
    if (existing && existing.uid !== memberId) throw new Error('This mobile number is already registered.');
    const mobileChanged = String(member.phone || '').replace(/\D/g, '') !== digits;
    const updated = { ...member, name, age, phone: digits, username: digits, whatsapp: whatsapp || digits, address: address || '', ...(mobileChanged ? { familyOwnerId: null } : {}) };
    upsertUser(updated);
    addActivity({ patientId: updated.patientId, phone: digits, type: 'account', title: 'Family member details updated', detail: `${updated.name} · Patient ID ${updated.patientId}` });
    return updated;
  }

  async function createStaffAccount({ name, email, phone, role, password, specialization, address }) {
    if (userProfile?.role !== 'admin') throw new Error('Only an admin can create staff accounts.');
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) throw new Error('A work email is required.');
    const pwd = password || DEMO_PASSWORD;
    if (auth && db && isFirebaseConfigured) {
      const secondary = initializeApp(firebaseConfig, `staff-${Date.now()}`);
      try {
        const secondaryAuth = getAuth(secondary);
        const cred = await createUserWithEmailAndPassword(secondaryAuth, normalizedEmail, pwd);
        const profile = {
          uid: cred.user.uid,
          name,
          email: normalizedEmail,
          phone: phone || '',
          address: address || '',
          role,
          specialization: specialization || '',
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        return { ...profile, tempPassword: pwd };
      } finally {
        await deleteApp(secondary);
      }
    }

    if (findUserByEmail(normalizedEmail)) throw new Error('That email is already in use.');
    const profile = {
      uid: `${role}-${Date.now()}`,
      name,
      email: normalizedEmail,
      password: pwd,
      phone,
      address,
      role,
      specialization,
    };
    upsertUser(profile);
    return { ...profile, tempPassword: pwd };
  }

  async function createPatientAccount({ name, age, email, phone, whatsapp, address, city, gender }) {
    const patientId = createPatientId();
    const resolvedEmail = email || phoneToEmail(phone);
    const pwd = patientId;
    if (auth && db && isFirebaseConfigured) {
      const secondary = initializeApp(firebaseConfig, `patient-${Date.now()}`);
      try {
        const secondaryAuth = getAuth(secondary);
        const cred = await createUserWithEmailAndPassword(secondaryAuth, resolvedEmail, pwd);
        const profile = { uid: cred.user.uid, name, email: resolvedEmail, phone: phone || '', whatsapp: whatsapp || phone || '', age: age || '', patientId, username: phone, address: address || '', city: city || '', gender: gender || '', role: 'patient', createdAt: serverTimestamp() };
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        return { ...profile, tempPassword: pwd };
      } finally {
        await deleteApp(secondary);
      }
    }
    if (findUserByPhone(phone) || findUserByEmail(resolvedEmail)) throw new Error('That mobile number or email is already registered.');
    const profile = { uid: `p-${Date.now()}`, name, email: resolvedEmail, password: pwd, phone, whatsapp: whatsapp || phone, age, patientId, username: phone, address, city, gender, role: 'patient' };
    upsertUser(profile);
    return { ...profile, tempPassword: pwd };
  }

  async function removePatientAccount(patient) {
    if (!patient || patient.role !== 'patient') throw new Error('Only patient accounts can be removed.');
    if (db && patient.uid) {
      try { await deleteDoc(doc(db, 'users', patient.uid)); } catch { /* local fallback */ }
    }
    removePatient(patient);
    return true;
  }

  async function promoteUser(uid, role) {
    if (userProfile?.role !== 'admin') throw new Error('Only an admin can change staff roles.');
    if (!uid || !role) throw new Error('A user and role are required.');
    if (db) await updateDoc(doc(db, 'users', uid), { role });
    const user = getUsers().find((u) => u.uid === uid);
    if (user) upsertUser({ ...user, role });
    if (currentUser?.uid === uid) {
      const updatedSession = { ...currentUser, role };
      setSession(updatedSession);
      setCurrentUser(updatedSession);
      setUserProfile((profile) => ({ ...profile, role }));
    }
  }

  const subscribeUsers = useCallback((callback) => {
    if (db) {
      try {
        return onSnapshot(collection(db, 'users'), (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
      } catch {
        // local
      }
    }
    return subscribeLocal(() => callback(getUsers().map((u) => ({ id: u.uid, ...u }))));
  }, []);

  const value = {
    currentUser,
    userProfile,
    role: userProfile?.role || null,
    loading,
    authError,
    setAuthError,
    register,
    login,
    logout,
    adoptPatientProfile,
    changePassword,
    addMobileNumber,
    addFamilyMember,
    updateFamilyMemberMobile,
    updateFamilyMemberDetails,
    createStaffAccount,
    createPatientAccount,
    removePatientAccount,
    promoteUser,
    subscribeUsers,
    isFirebaseConfigured,
    dashboardPath,
    demoMode: !isFirebaseConfigured,
    theme,
    language,
    updateTheme,
    updateLanguage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
