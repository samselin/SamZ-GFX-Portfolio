// src/components/PageTransition.jsx
import { motion } from 'framer-motion'
import { pageTransition } from '../animations/variants'

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}
