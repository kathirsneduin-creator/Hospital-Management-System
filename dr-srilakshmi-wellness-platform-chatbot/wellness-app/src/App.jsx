import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardShell from './components/layout/DashboardShell';
import ProtectedRoute from './routes/ProtectedRoute';

import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import PatientOverview from './pages/dashboard/patient/PatientOverview';
import PatientAppointments from './pages/dashboard/patient/PatientAppointments';
import HealthJournal from './pages/dashboard/patient/HealthJournal';
import PatientPrescriptions from './pages/dashboard/patient/PatientPrescriptions';
import PatientNutrition from './pages/dashboard/patient/PatientNutrition';
import PatientSessions from './pages/dashboard/patient/PatientSessions';
import PatientActivity from './pages/dashboard/patient/PatientActivity';
import PatientSettings from './pages/dashboard/patient/PatientSettings';
import PatientInvoices from './pages/dashboard/patient/PatientInvoices';

import DoctorOverview from './pages/dashboard/doctor/DoctorOverview';
import DoctorAppointments from './pages/dashboard/doctor/DoctorAppointments';
import DoctorPatients from './pages/dashboard/doctor/DoctorPatients';
import DoctorPrescriptions from './pages/dashboard/doctor/DoctorPrescriptions';
import DoctorContent from './pages/dashboard/doctor/DoctorContent';

import AdminOverview from './pages/dashboard/admin/AdminOverview';
import AdminUsers from './pages/dashboard/admin/AdminUsers';
import AdminAppointments from './pages/dashboard/admin/AdminAppointments';
import AdminAnalytics from './pages/dashboard/admin/AdminAnalytics';

import ReceptionOverview from './pages/dashboard/receptionist/ReceptionOverview';
import WorkerOverview from './pages/dashboard/worker/WorkerOverview';
import MedicalDesk from './pages/dashboard/worker/MedicalDesk';
import MedicalInvoices from './pages/dashboard/worker/MedicalInvoices';

function LandingRedirect({ hash }) {
  return <Navigate to={`/${hash}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<LandingRedirect hash="#programs" />} />
        <Route path="/live-sessions" element={<LandingRedirect hash="#live-sessions" />} />
        <Route path="/nutrition" element={<LandingRedirect hash="#nutrition" />} />
        <Route path="/about" element={<LandingRedirect hash="#about" />} />
        <Route path="/contact" element={<LandingRedirect hash="#contact" />} />
        <Route path="/appointments" element={<LandingRedirect hash="#book" />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/dashboard/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DashboardShell role="patient" />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientOverview />} />
        <Route path="activity" element={<PatientActivity />} />
        <Route path="settings" element={<PatientSettings />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="journal" element={<HealthJournal />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="nutrition" element={<PatientNutrition />} />
        <Route path="sessions" element={<PatientSessions />} />
        <Route path="invoices" element={<PatientInvoices />} />
      </Route>

      <Route
        path="/dashboard/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DashboardShell role="doctor" />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorOverview />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="content" element={<DoctorContent />} />
      </Route>

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardShell role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      <Route
        path="/dashboard/receptionist"
        element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <DashboardShell role="receptionist" />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReceptionOverview />} />
        <Route path="appointments" element={<AdminAppointments />} />
      </Route>

      <Route
        path="/dashboard/worker"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <DashboardShell role="worker" />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkerOverview />} />
        <Route path="medical" element={<MedicalDesk />} />
        <Route path="invoices" element={<MedicalInvoices />} />
      </Route>

      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
