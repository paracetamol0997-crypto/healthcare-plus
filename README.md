# 🌿 Health Companion AI

> **"Your personal wellness companion for mental and physical health."**

A modern, responsive, and visually calming web application that unites the care of a **family doctor**, the mindfulness of a **wellness mentor**, the motivation of a **fitness trainer**, and the empathy of a **mental health companion**.

---

## 🎨 Theme & Calming Design Philosophy

Inspired by platforms like **Headspace**, **Calm**, and **Fitbit**, the user experience is designed to feel like an emotional sanctuary rather than a sterile clinical hospital:

- **Calming Palette:**
  - Soft Blue (`#EAF4FF`) — peace, recovery, hydration
  - Light Green (`#E8F5E9`) — vitality, growth, natural balance
  - Crisp Soft White (`#FFFFFF`) & Light Gray (`#F5F5F5`)
  - Dark Mode: Deep Midnight Navy (`#0B1320`, `#152238`)
- **Emotional Feeling:** Relaxed, safe, encouraged, positive, and comfortable.
- **Glassmorphism & Smooth Transitions:** Rounded cards (`rounded-3xl`), gentle shadows, and fluid animations.
- **Accessibility:** Semantic HTML, ARIA labels, high-contrast text, and responsive design for mobile, tablet, and desktop.

---

## 🧠 Core Sections & Capabilities

### 1. Landing Page
- **Hero Section:** Tagline, wellness visual cards (Meditation, Fitness, Nutrition), and quick action buttons (**Get Started**, **Try as Pavan Demo**, **Sign In**).
- **About the Platform:** Explains the mind-body connection and holistic approach.
- **Feature Showcase:** Deep dive into Mind Companion and Fit Companion.
- **Live Interactive AI Preview:** Chat with the companion directly from the homepage.
- **Testimonials & AI Benefits:** Empathetic listening, habit tracking, privacy, and zero medical jargon.
- **Emergency Crisis Notice Banner:** 24/7 hotlines and safety disclaimers.

### 2. Authentication & Profile System
- **Login, Register, and Forgot Password:**
  - **1-Click Demo Login (`Pavan`):** Allows immediate exploration without typing.
  - **Two-Step Onboarding:** Collects vital metrics (Age, Gender, Height, Weight, Fitness Goals, Mental Wellness Goals).
  - **Live BMI Calculator:** Automatically computes Body Mass Index and provides personalized lifestyle advice.
  - **Custom AI Engine Settings:** Option to input a personal Google Gemini API key or use the built-in offline wellness engine.

### 3. Personalized Dashboard
- **Dynamic Time-Aware Greeting:** *"Good Morning / Afternoon / Evening, Pavan! How are you feeling today?"*
- **🔥 7-Day Wellness Streak** & Today's Date.
- **Mood Status:** One-click emotion check-in and current status badge.
- **Daily Activity Summary:**
  - Steps counter with animated progress bar toward the 10,000 steps goal.
  - Water intake counter (glasses and milliliters).
  - Active workout minutes and caloric burn calculation.
- **7-Day Progress Charts:** Interactive Recharts area chart for steps, water, and workouts.
- **Doctor's Daily Tip & Mindful Affirmation of the Day.**

### 4. Mental Health Section ("Mind Companion AI")
- **Interactive Guided Breathing Sphere:**
  - 3 Science-backed modes:
    - **Box Breathing (4-4-4-4):** Stress reduction & focus.
    - **4-7-8 Tranquilizer:** Calms the vagus nerve for restful sleep.
    - **Deep Resonance (5-5):** Synchronizes heart rate variability (HRV).
  - Visual expanding/contracting sphere with audio chimes (Web Audio API) and celebration confetti upon completion.
- **Mindful Journal:** Guided gratitude and reflection prompts with save, search, and delete capabilities.
- **Daily Affirmations:** Curated categories (Peace, Vitality, Self-Care, Resilience).
- **Calming Soundscapes:** Ambient audio synthesizer (Gentle Rain, Ocean Waves, Mountain Breeze, 432Hz Meditation Drone).
- **Mind Companion AI Chat:** Specialized in stress management, anxiety relief, emotional validation, and sleep hygiene.

### 5. Physical Health Section ("Fit Companion AI")
- **Step Tracker:** Distance in kilometers and active caloric burn calculations. Quick step increment buttons (+500, +1,000, +2,500 steps).
- **Workout Logger:** Log sessions across categories (Walking, Running, Gym, Yoga, Stretching, HIIT, Cycling) with intensity levels.
- **Interactive Water Tracker:** 8-cup visual grid with click-to-drink and target achievements.
- **Guided Exercise Plans:**
  - *Desk Worker Posture Reset (6 mins)*
  - *Full-Body Foundation Routine (20 mins)*
  - *Sunrise Energy Yoga Flow (15 mins)*
  - Includes step-by-step cues and live exercise countdown timers.
- **Nutrition & Clean Plate Framework:** Balanced plate guidance (50% greens, 25% protein, 25% smart carbs).
- **Fit Companion AI Chat:** Specialized in gym routines, bodyweight exercises, form corrections, and nutrition.

### 6. AI System & Strict Domain Guardrails
The platform includes two specialized assistants or a unified companion:
1. **Mind Companion AI** (Mental wellness & mindfulness)
2. **Fit Companion AI** (Physical fitness & nutrition)
3. **Health Companion AI** (Unified holistic mentor)

#### 🛡️ Strict Health Guardrails
The assistant **only** answers mental and physical health topics. If a user asks about programming, politics, entertainment, crypto, or trivia, it politely responds:
> *"I am designed to help with mental wellness and physical health. How can I support your wellness journey today?"*

- **Gemini API Integration:** Built-in connection to Google Gemini 1.5 / 2.0 (`GEMINI_API_KEY`).
- **Contextual Fallback Engine:** If no key is set or in offline mode, it seamlessly delivers thoughtful, personalized wellness advice tailored to the user's profile and sentiment.
- **Voice Readout:** Built-in Web Speech API audio synthesis to listen to calming responses.

### 7. Emergency Support & Crisis Resources
- **Dedicated Emergency Page (`/emergency`) & Modal:**
  - 988 Suicide & Crisis Lifeline (US & Canada)
  - 111 NHS Mental Health Helpline (UK)
  - 9152987821 KIRAN National Helpline (India)
  - Crisis Text Line (Text `HOME` to 741741)
  - Immediate 5-4-3-2-1 Grounding instructions for panic attacks.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti.
- **Backend:** Node.js, Express.js, JWT, bcryptjs, CORS, dotenv.
- **Database:** PostgreSQL schema (`schema.sql`) + dual-storage local JSON fallback (`store.json`) for zero-configuration startup.
- **AI Engine:** Google Gemini API + Health Guardrails Filter + Local Fallback Knowledge Engine.

---

## 🚀 Running the Project Locally

### 1. Clone & Install
```bash
# In the project root directory
npm run install:all
```
*(Or install in client and server separately: `cd client && npm install`, `cd ../server && npm install`)*

### 2. Start the Backend Server (Port 5000)
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### 3. Start the Frontend Application (Port 5173)
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo Account Credentials

For instant testing, click **"Try as Pavan"** on the landing page or login screen:
- **Email:** `pavan@healthcompanion.ai`
- **Password:** `wellness123`

---

## 🌐 Deployment Guide (Vercel + Render)

### Backend on Render:
1. Create a new **Web Service** on [Render](https://render.com).
2. Point to the `server/` directory.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Optional environment variables:
   - `DATABASE_URL`: (Your PostgreSQL connection string from Supabase/Neon/Render PostgreSQL)
   - `GEMINI_API_KEY`: (Your Google AI Gemini key)
   - `JWT_SECRET`: (Any secure random string)

### Frontend on Vercel:
1. Import repository on [Vercel](https://vercel.com).
2. Root directory: `client`
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Set environment variable: `VITE_API_URL` pointing to your Render backend URL.

---

## 📜 Medical Disclaimer
*Health Companion AI is an informational wellness and lifestyle platform designed to encourage positive habits and self-care. It does not provide medical diagnoses, clinical treatment, or emergency intervention. Always consult a licensed physician or mental health professional for medical concerns.*
