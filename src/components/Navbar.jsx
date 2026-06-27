// src/components/Navbar.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLogin from '../admin/AdminLogin'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/ai-studio', label: 'AI Studio' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  // Hidden admin trigger: click logo 3× within 2s
  const clickCount = useRef(0)
  const clickTimer = useRef(null)

  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY
    setAtTop(currentY < 20)
    if (currentY < lastScrollY.current || currentY < 80) {
      setVisible(true)
    } else {
      setVisible(false)
      setMenuOpen(false)
    }
    lastScrollY.current = currentY
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleLogoClick = () => {
    clickCount.current += 1
    if (clickTimer.current) clearTimeout(clickTimer.current)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      setShowAdminLogin(true)
    } else {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0
      }, 1800)
    }
  }

  return (
    <>
      <motion.nav
        className={`navbar ${atTop ? '' : 'scrolled'}`}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="navbar__inner">
          {/* Logo */}
          <button className="navbar__logo" onClick={handleLogoClick} aria-label="Home">
            <span className="navbar__logo-mark">SS</span>
            <span className="navbar__logo-text">Sam Selin</span>
          </button>

          {/* Desktop Links */}
          <ul className="navbar__links">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'active' : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link to="/contact" className="navbar__cta btn btn-ghost">
            Let's Talk
          </Link>

          {/* Mobile hamburger */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="navbar__mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className="navbar__mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hidden Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <AdminLogin onClose={() => setShowAdminLogin(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
