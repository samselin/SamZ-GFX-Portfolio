// src/App.jsx
import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Preloader from './components/Preloader'
import ScrollProgress from './components/ScrollProgress'
import ScrollToTop from './components/ScrollToTop'
import FilmGrain from './components/FilmGrain'
import AdminGuard from './admin/AdminGuard'

// Lazy-load pages for performance
const Home           = lazy(() => import('./pages/Home'))
const Portfolio      = lazy(() => import('./pages/Portfolio'))
const AIStudio       = lazy(() => import('./pages/AIStudio'))
const ProjectDetail  = lazy(() => import('./pages/ProjectDetail'))
const About          = lazy(() => import('./pages/About'))
const Contact        = lazy(() => import('./pages/Contact'))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'))
const NotFound       = lazy(() => import('./pages/NotFound'))

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
      

      {/* Navbar — hidden on admin pages */}
      {!isAdmin && <Navbar />}
      {!isAdmin && <ScrollToTop />}

      {/* Page transitions with AnimatePresence */}
      <AnimatePresence mode="wait" initial={false}>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"              element={<Home />} />
            <Route path="/portfolio"     element={<Portfolio />} />
            <Route path="/ai-studio"     element={<AIStudio />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}
