# Sam Selin — 3D Generalist Portfolio

A production-grade, Apple-inspired portfolio website for 3D generalist **Sam Selin**.

Built with **React + Vite**, **Framer Motion**, **GSAP ScrollTrigger**, and **Firebase**.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Design** | Apple-minimal, dark, cinematic |
| **Hero** | Mouse parallax, large display type, animated buttons |
| **Featured Works** | 6-project grid with 3D tilt + glow hover |
| **Skills Section** | Blender, After Effects, Photoshop, DaVinci Resolve, CapCut |
| **About Preview** | Split layout with availability badge |
| **Showreel** | Autoplay muted looping video |
| **Contact CTA** | Animated link list |
| **Portfolio Page** | GSAP horizontal scroll (pinned) with 3D tilt cards |
| **Project Detail** | Parallax hero, info grid, gallery, breakdown, software tags, turntable video |
| **About Page** | Bio, animated skill bars, timeline, goals |
| **Contact Page** | Animated link rows with arrow reveal |
| **Navbar** | Glass blur, hide-on-scroll-down, show-on-scroll-up |
| **Page Transitions** | Framer Motion fade+slide |
| **Cursor Glow** | Smooth lerp-following radial gradient |
| **Admin Panel** | Hidden — triple-click logo → login modal → dashboard |
| **Admin Dashboard** | Upload/Edit/Delete projects, image upload with progress |
| **Firebase** | Firestore (project data) + Storage (images/videos) |
| **Mock Data** | Works offline — falls back to 6 sample projects |
| **Performance** | Lazy loading, code splitting, React Suspense |

---

## 📁 Project Structure

```
src/
├── admin/
│   ├── AdminDashboard.jsx  # Full CRUD admin panel
│   ├── AdminGuard.jsx      # Route protection
│   └── AdminLogin.jsx      # Hidden login modal
├── animations/
│   └── variants.js         # Framer Motion reusable variants
├── components/
│   ├── CursorGlow.jsx      # Mouse-following ambient glow
│   ├── Navbar.jsx          # Floating glass navbar
│   ├── PageTransition.jsx  # Fade+slide wrapper
│   └── ProjectCard.jsx     # Reusable 3D tilt card
├── data/
│   └── mockProjects.js     # Offline fallback data
├── firebase/
│   ├── config.js           # Firebase initialization
│   └── projects.js         # Firestore & Storage CRUD
├── hooks/
│   └── useProjects.js      # Data fetching hook
├── pages/
│   ├── About.jsx           # About page
│   ├── Contact.jsx         # Contact page
│   ├── Home.jsx            # Landing page (all sections)
│   ├── Portfolio.jsx       # Horizontal scroll portfolio
│   └── ProjectDetail.jsx   # Dynamic project page
├── styles/
│   └── global.css          # Design tokens + global styles
├── App.jsx                 # Router + AnimatePresence
└── main.jsx                # React entry point
```

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → Enable Firestore + Storage
3. Copy `.env.example` → `.env.local`
4. Paste your Firebase config values

```bash
cp .env.example .env.local
# then edit .env.local with your values
```

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

---

## 🔐 Admin Panel

The admin route (`/admin`) is **not linked anywhere** in the UI.

**To access:**
1. Click the **"SS" logo in the navbar 3 times** quickly (within 2 seconds)
2. A login modal will appear
3. Enter password: **`sam3dadmin`**
4. You'll be redirected to `/admin`

**Admin features:**
- View all projects
- Upload new project (with image upload to Firebase Storage)
- Edit existing project
- Delete project (with confirmation modal)

---

## 🔥 Firebase Setup Guide

### Firestore
1. Firebase Console → Firestore Database → Create database
2. Start in **production mode**
3. Deploy rules: `firebase deploy --only firestore:rules`

### Storage
1. Firebase Console → Storage → Get started
2. Deploy rules: `firebase deploy --only storage:rules`

### Project Schema
```js
{
  title: string,        // "Neon Drift"
  category: string,     // "Product Visualization"
  description: string,  // long text
  images: string[],     // array of Storage URLs
  thumbnail: string,    // first image URL (auto-set)
  video: string,        // optional video URL
  software: string[],   // ["Blender", "After Effects"]
  year: number,         // 2024
  createdAt: timestamp  // auto-set by Firebase
}
```

---

## 🌐 Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Hosting)
firebase init

# Build + Deploy
npm run build && firebase deploy
```

---

## 🎨 Design System

All design tokens are in `src/styles/global.css`:

| Token | Value |
|---|---|
| `--c-black` | `#050505` |
| `--c-white` | `#f5f5f0` |
| `--c-accent` | `#e8e0d0` |
| `--font-display` | Bebas Neue |
| `--font-body` | DM Sans |
| `--font-mono` | DM Mono |

---

## 📸 Customization

### Replace placeholder images
- **Profile photo** → search `about-profile__image-wrap img src` in `About.jsx`
- **Showreel video** → uncomment `<source>` tag in `Home.jsx`, point to your MP4
- **Project thumbnails** → upload via Admin Panel or edit `mockProjects.js`

### Update contact links
Edit the `CONTACTS` array in `Home.jsx` and `LINKS` array in `Contact.jsx`

### Change admin password
Edit `SECRET_PASSWORD` in `src/admin/AdminLogin.jsx`

---

## 🛠 Tech Stack

- **React 18** + **Vite 5**
- **React Router 6** — client-side routing
- **Framer Motion 10** — page transitions + scroll animations
- **GSAP 3** + **ScrollTrigger** — horizontal scroll, parallax
- **Firebase 10** — Firestore + Storage + Hosting
- **react-intersection-observer** — viewport detection
- **Google Fonts** — Bebas Neue, DM Sans, DM Mono
