// src/components/Preloader.jsx
// Cinematic SS logo intro shown once per session.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Preloader.css'

export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    // Only show once per browser session
    return !sessionStorage.getItem('ss_preloaded')
  })

  useEffect(() => {
    if (!visible) return
    // Lock scroll during preloader
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('ss_preloaded', '1')
      document.body.style.overflow = ''
    }, 2600)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* Logo reveal */}
          <div className="preloader__logo">
            <motion.span
              className="preloader__letters display"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              SS
            </motion.span>

            <motion.span
              className="preloader__sub mono"
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={{ opacity: 1, letterSpacing: '0.25em' }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              SamZ GFX
            </motion.span>
          </div>

          {/* Progress line */}
          <motion.div
            className="preloader__bar"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.0, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Wipe-up exit curtain */}
          <motion.div
            className="preloader__curtain"
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1, originY: 1, transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
