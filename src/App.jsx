// src/App.jsx
import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import Preloader from './components/Preloader'
import ScrollProgress from './components/ScrollProgress'
import FilmGrain from './components/FilmGrain'
import CursorGlow from './components/CursorGlow'
import AdminGuard from './admin/AdminGuard'

// Lazy-load pages for performance
const Home           = lazy(() => import('./pages/Home'))
const Portfolio      = lazy(() => import('./pages/Portfolio'))
const ProjectDetail  = lazy(() => import('./pages/ProjectDetail'))
const About          = lazy(() => import('./pages/About'))
const Contact        = lazy(() => import('./pages/Contact'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))

function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 80,
          height: 1,
          background: 'var(--c-grey-3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--c-white)',
            animation: 'loadBar 1s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      <Preloader />
      <ScrollProgress />
      <FilmGrain />
      
      {/* Custom cursor (desktop only, hides system cursor) */}
      <CustomCursor />
      <CursorGlow />

      {/* Navbar — hidden on admin pages */}
      {!isAdmin && <Navbar />}

      {/* Page transitions with AnimatePresence */}
      <AnimatePresence mode="wait" initial={false}>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"              element={<Home />} />
            <Route path="/portfolio"     element={<Portfolio />} />
            <Route path="/project/:id"   element={<ProjectDetail />} />
            <Route path="/about"         element={<About />} />
            <Route path="/contact"       element={<Contact />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            {/* 404 fallback */}
            <Route path="*" element={
              <div className="page container" style={{ display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'2rem' }}>
                <h1 className="display" style={{ fontSize: 'clamp(5rem, 12vw, 10rem)', color: 'var(--c-white)' }}>404</h1>
                <p style={{ color: 'var(--c-grey-5)' }}>This page does not exist.</p>
                <a href="/" className="btn btn-ghost">← Go Home</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}
