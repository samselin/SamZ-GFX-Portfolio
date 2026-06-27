// src/pages/NotFound.jsx
// Brand-aligned 404 with the WireframeSphere 3D element.
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import WireframeSphere from '../components/WireframeSphere'
import '../components/WireframeSphere.css'
import './NotFound.css'

export default function NotFound() {
  return (
    <PageTransition>
      <div className="not-found page">
        <div className="not-found__inner">
          <motion.div
            className="not-found__sphere"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <WireframeSphere />
          </motion.div>

          <motion.h1
            className="not-found__title display"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Lost in
            <br />
            <span className="not-found__title--outline">Dimensions.</span>
          </motion.h1>

          <motion.p
            className="not-found__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            The page you tried to reach doesn't exist in this coordinate.
          </motion.p>

          <motion.div
            className="not-found__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/" className="btn btn-primary">← Back Home</Link>
            <Link to="/portfolio" className="btn btn-ghost">Browse Work</Link>
          </motion.div>

          <motion.span
            className="mono not-found__code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            ERROR · 404
          </motion.span>
        </div>
      </div>
    </PageTransition>
  )
}