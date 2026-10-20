# Dr. Srilakshmi Homeo & Yoga Clinic — Smart Digital Wellness Platform

A production-ready React + Vite + Tailwind + Firebase web app for the clinic, with role-based
Patient / Doctor / Admin dashboards, an AI Wellness Assistant, WhatsApp click-to-chat, and full
appointment booking.

## Tech Stack
React 18 · Vite · Tailwind CSS · React Router v7 · Firebase (Auth, Firestore, Storage) · Lucide Icons

## 1. Install

```bash
npm install
```

## 2. Firebase Setup (required)

1. Go to the [Firebase Console](https://console.firebase.google.com) → **Create a project**.
2. Add a **Web App** to the project and copy the config values.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Enable **Cloud Firestore** (start in *test mode* for development).
5. Enable **Storage** if you plan to let doctors upload prescription PDFs.
6. Copy `.env.example` to `.env` and fill in your Firebase values:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Firestore collections used

| Collection        | Purpose                                         |
|--------------------|--------------------------------------------------|
| `users`            | Profile + `role` (`patient` \| `doctor` \| `admin`) |
| `appointments`     | Bookings from the public form and dashboards     |
| `journalEntries`   | Patient health journal entries                   |
| `prescriptions`    | Digital prescriptions written by doctors         |

### Suggested Firestore security rules (starting point — tighten before production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /appointments/{id} {
      allow create: if true;
      allow read, update: if request.auth != null;
    }
    match /journalEntries/{id} {
      allow create: if request.auth.uid == request.resource.data.patientId;
      allow read: if request.auth.uid == resource.data.patientId;
    }
    match /prescriptions/{id} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

### Creating the first Admin account

Patients and Doctors can self-register from `/register`. Admin accounts are sensitive, so they are
**not** self-serve: register a normal account, then in the Firebase Console → Firestore → `users`
collection, open that user's document and change `role` from `patient` to `admin`.

## 3. AI Wellness Assistant (Gemini)

Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and add it to `.env`:

```
VITE_GEMINI_API_KEY=your_key_here
```

Without a key, the assistant still opens and replies with a helpful demo message so the UI is fully
reviewable before you wire up billing.

> **Security note:** this demo calls Gemini directly from the browser for simplicity. For a real
> production deployment, proxy the request through a small backend/Cloud Function so your API key is
> never exposed to the client.

## 4. WhatsApp

The floating WhatsApp button opens `https://wa.me/<number>` with a pre-filled message — no backend
needed. Set your number in `.env`:

```
VITE_WHATSAPP_PHONE=919443629722
```

**"WhatsApp automation"** (auto appointment reminders, confirmations, chatbot flows) requires the
official WhatsApp Business Platform (Meta Cloud API) or a provider like Twilio/Gupshup, plus a backend
(e.g. a Firebase Cloud Function) to send messages server-side — this cannot run from the browser alone.
The `appointments` Firestore collection is already structured so a Cloud Function can trigger a
WhatsApp message `onCreate`/`onUpdate` once you connect a provider.

## 5. Run

```bash
npm run dev
```

Visit `http://localhost:5173`.

## 6. Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    layout/     Navbar, Footer, TopBar, WhatsAppButton, AIAssistantWidget, DashboardShell
    ui/         Button, Card, PageHero, ContactForm, ContactInfoCard
  context/      AuthContext (Firebase Auth + role)
  data/         Static content (programs, services, nutrition plans, live sessions)
  firebase/     Firebase app config
  lib/          AI assistant (Gemini) integration
  pages/        Public pages (Home, Programs, Live Sessions, Nutrition, About, Contact, Appointments)
    auth/       Login, Register
    dashboard/
      patient/  Overview, Appointments, Health Journal, Prescriptions, Nutrition Plan, Live Sessions
      doctor/   Overview, Appointments, Patients, Prescriptions, Content & Sessions
      admin/    Overview, Users, Appointments, Analytics
  routes/       ProtectedRoute (role-based route guard)
```

## Design System

- Primary `#2E7D32` · Secondary `#81C784` · Background `#F8FCF8`
- Fonts: **Poppins** (headings) + **Inter** (body)
- Glassmorphism surfaces, rounded UI, Apple-level spacing — tokens live in `src/index.css`
  (`:root` custom properties) and `tailwind.config.js`.
- Reusable button variants: `primary`, `secondary`, `outline`, `ghost`, `glass`.
- Reusable card variants: `default`, `outline`, `glass`, `dark`.

## What's stubbed / needs your data

- Replace hero, doctor, and program photography (`data/content.js`, `pages/Home.jsx`, `pages/About.jsx`)
  with the clinic's real photos.
- Google Maps embed on Contact/About uses a generic query for the clinic's town — swap in the exact
  place ID once available.
- Razorpay checkout for Nutrition Plans / paid programs is not wired up yet — the "Buy Now" buttons
  currently link to the appointment form. Add the Razorpay Checkout script and an order-creation Cloud
  Function to accept real payments.
- WhatsApp automation and SMS/email confirmations need a backend (see section 4).
