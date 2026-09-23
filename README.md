# 🩸 Local Blood Donor Finder

> **Connecting Life Savers with Those in Need** — A fast, modern, and centralized web platform designed to bridge the gap between voluntary blood donors and recipients during critical medical emergencies.

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Core Features](#-core-features)
- [Application Pages](#-application-pages)
- [Technology Stack](#-technology-stack)
- [Project Architecture & Structure](#-project-architecture--structure)
- [Prerequisites](#-prerequisites)
- [Installation & Getting Started](#-installation--getting-started)
- [Firebase Setup & Configuration](#-firebase-setup--configuration)
- [Running the Project](#-running-the-project)
- [Available Scripts](#-available-scripts)
- [Blood Group Compatibility Guide](#-blood-group-compatibility-guide)
- [License](#-license)

---

## 🌟 About the Project

**Local Blood Donor Finder** is a community-driven web application that empowers individuals to locate compatible blood donors in their immediate geographical vicinity quickly and reliably. 

Donors can register their profiles, specify blood groups (A+, A-, B+, B-, O+, O-, AB+, AB-), set availability statuses, and update donation history. Recipients or hospitals facing emergencies can post urgent blood requests, search verified donors with multi-criteria filtering, and initiate direct communication.

---

## ⚠️ Problem Statement

During medical emergencies, finding matching blood donors rapidly is often chaotic and stressful. Families and medical staff frequently rely on fragmented channels such as social media broadcasts, instant messaging groups, and word-of-mouth. 

**Local Blood Donor Finder** solves this problem by providing:
- A single centralized hub for real-time donor availability.
- Multi-criteria location & blood-group search.
- Urgent emergency request broadcasts.
- Transparent and verified donor profiles.

---

## ✨ Core Features

- 🔍 **Smart Donor Search**: Filter donors by blood group, city/state, availability, and donation eligibility.
- 📝 **Donor Registration**: Comprehensive onboarding form capturing personal, medical, and contact information.
- 🚨 **Emergency Blood Requests**: Post high-priority requests specifying units required, hospital details, and urgency level.
- 📊 **Interactive Dashboard**: Track user donations, active blood requests, response rates, and emergency alerts.
- 👤 **Donor Profile Management**: Easily toggle availability (`Available` / `Busy` / `Recently Donated`), view donation logs, and edit contact info.
- 💬 **Direct Messaging**: Connect donors with seekers instantly to coordinate logistics.
- 🎨 **Modern Crimson Design System**: Fully custom, responsive, accessible UI built with CSS custom properties and sleek micro-interactions.

---

## 📄 Application Pages

The application is structured into **12 dedicated, modular page views**:

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | **Home** | `/` | Hero introduction, live stats, quick search preview, key benefits, and calls-to-action. |
| 2 | **Login** | `/login` | Secure user authentication, password recovery, and onboarding redirect. |
| 3 | **Donor Registration** | `/register` | Multi-field registration for prospective blood donors. |
| 4 | **Dashboard** | `/dashboard` | User command center showing donation stats, quick actions, and active requests. |
| 5 | **Donor Profile** | `/profile` | Donor detail editor, availability toggle, and personal donation history. |
| 6 | **Search Donors** | `/search` | Advanced search grid with blood group, city, and status filters. |
| 7 | **Blood Request** | `/request` | Emergency request creation form with hospital and unit details. |
| 8 | **My Blood Requests** | `/my-requests` | Manage, edit, and monitor status of submitted blood requests. |
| 9 | **Donor Details** | `/donor/:id` | Detailed individual donor public profile with contact action buttons. |
| 10 | **Messages** | `/messages` | In-app chat interface between donors and request creators. |
| 11 | **About Us** | `/about` | Platform mission, core values, impact statistics, and team vision. |
| 12 | **Contact Us** | `/contact` | Inquiry form, emergency helpline info, and FAQ section. |

---

## 💻 Technology Stack

### **Frontend**
- **Core Library**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (Modular design tokens with custom CSS per page)

### **Backend (API Server)**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Middlewares**: `cors`, `dotenv`

### **Database & Authentication**
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL real-time document store)

---

## 📁 Project Architecture & Structure

The project follows a clean, modular folder-per-page architecture:

```
local-blood-donor/
├── server/                          # Backend Express server
│   ├── index.js                     # API entry point & routes
│   ├── package.json                 # Backend dependencies
│   └── package-lock.json
│
├── src/
│   ├── assets/                      # Static assets (images, logos, SVGs)
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/                  # Global reusable UI components
│   │   ├── Navbar.jsx & Navbar.css  # Top navigation bar
│   │   └── Footer.jsx & Footer.css  # Global footer
│   │
│   ├── context/                     # Global State & Context Providers
│   │   └── AuthContext.jsx          # Firebase Auth state manager
│   │
│   ├── firebase/                    # Firebase client initialization
│   │   └── config.js                # Firebase app & Firestore configuration
│   │
│   ├── pages/                       # 12 Modular Page Components
│   │   ├── AboutUs/                 # AboutUs.jsx + AboutUs.css
│   │   ├── BloodRequest/            # BloodRequest.jsx + BloodRequest.css
│   │   ├── ContactUs/               # ContactUs.jsx + ContactUs.css
│   │   ├── Dashboard/               # Dashboard.jsx + Dashboard.css
│   │   ├── DonorDetails/            # DonorDetails.jsx + DonorDetails.css
│   │   ├── DonorProfile/            # DonorProfile.jsx + DonorProfile.css
│   │   ├── DonorRegistration/       # DonorRegistration.jsx + DonorRegistration.css
│   │   ├── Home/                    # Home.jsx + Home.css
│   │   ├── Login/                   # Login.jsx + Login.css
│   │   ├── Messages/                # Messages.jsx + Messages.css
│   │   ├── MyBloodRequests/         # MyBloodRequests.jsx + MyBloodRequests.css
│   │   └── SearchDonors/            # SearchDonors.jsx + SearchDonors.css
│   │
│   ├── App.jsx                      # App root router configuration
│   ├── App.css                      # Global app container styles
│   ├── index.css                    # Design tokens (colors, typography, resets)
│   └── main.jsx                     # Vite entry point
│
├── index.html                       # HTML template
├── package.json                     # Frontend dependencies & scripts
├── vite.config.js                   # Vite build configuration
└── README.md                        # Documentation
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher (bundled with Node.js)
- A modern web browser (Chrome, Firefox, Edge, Safari)

---

## 🚀 Installation & Getting Started

### 1. Clone or Open the Project

Navigate to the project root directory in your terminal:
```bash
cd local-blood-donor
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

---

## 🔐 Firebase Setup & Configuration

1. Create a Firebase project at the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password provider).
3. Enable **Cloud Firestore** in test or production mode.
4. Obtain your Firebase Web App configuration credentials.
5. Update `src/firebase/config.js` with your Firebase project keys:

```javascript
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

---

## 🏃 Running the Project

To run the complete full-stack application, start both the frontend and backend servers:

### Option A: Run in Two Separate Terminals (Recommended)

**Terminal 1 — Frontend (Vite Dev Server):**
```bash
# In the root folder (local-blood-donor)
npm run dev
```
*The frontend will run at:* `http://localhost:5173` *(or `http://localhost:5174` if 5173 is in use)*

**Terminal 2 — Backend (Express Server):**
```bash
# In the server folder (local-blood-donor/server)
cd server
npm run dev
```
*The backend API will run at:* `http://localhost:5000`

---

## 📜 Available Scripts

### Frontend (`/package.json`)
- `npm run dev` — Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build` — Compiles and bundles production-ready assets into the `dist/` directory.
- `npm run preview` — Locally previews the production build.
- `npm run lint` — Runs ESLint to check for code quality and syntax issues.

### Backend (`/server/package.json`)
- `npm run start` — Starts the Express backend server with Node.js.
- `npm run dev` — Starts the Express backend with auto-reload (`node --watch index.js`).

---

## 🩸 Blood Group Compatibility Guide

| Blood Group | Can Donate To | Can Receive From |
|-------------|---------------|------------------|
| **O-** | Universal Donor (All Types) | O- |
| **O+** | O+, A+, B+, AB+ | O+, O- |
| **A-** | A+, A-, AB+, AB- | A-, O- |
| **A+** | A+, AB+ | A+, A-, O+, O- |
| **B-** | B+, B-, AB+, AB- | B-, O- |
| **B+** | B+, AB+ | B+, B-, O+, O- |
| **AB-** | AB+, AB- | AB-, A-, B-, O- |
| **AB+** | AB+ | Universal Recipient (All Types) |

---

## 🛡️ License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ to save lives.
