// src/pages/Contact.jsx
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import { fadeUp } from '../animations/variants'
import './Contact.css'

const LINKS = [
  {
    label: 'Email',
    value: 'samzgfx8@gmail.com',
    href: 'mailto:samzgfx8@gmail.com',
    desc: 'Best for project inquiries',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/s_am_selin',
    href: 'https://linkedin.com/in/samselin',
    desc: 'Professional network',
  },
  {
    label: 'Instagram',
    value: '@samz_gfx',
    href: 'https://www.instagram.com/samz_gfx?igsh=NjNhOGM5N3o3Zzc3',
    desc: 'Daily process & renders',
  },
  {
    label: 'YouTube',
    value: 'youtube.com/@SamzGfx',
    href: 'https://www.youtube.com/@SamzGfx',
    desc: 'Breakdowns & timelapses',
  },
]

export default function Contact() {
  return (
    <PageTransition>
      <div className="contact-page page">
        <div className="container">

          {/* Header */}
          <div className="contact-header">
            <motion.span
              className="section-label"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Contact
            </motion.span>
            <motion.h1
              className="contact-title display"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              Let's Talk
            </motion.h1>
            <motion.p
              className="contact-sub"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
            >
              Open to freelance projects, collaborations, and full-time opportunities.
              Pick your preferred channel below.
            </motion.p>
          </div>

          {/* Links */}
          <div className="contact-links">
            {LINKS.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="contact-link-item"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.25 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="contact-link-item__left">
                  <span className="mono contact-link-item__num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="contact-link-item__label display">
                      {link.label}
                    </div>
                    <div className="contact-link-item__desc mono">
                      {link.desc}
                    </div>
                  </div>
                </div>
                <div className="contact-link-item__right">
                  <span className="contact-link-item__value">{link.value}</span>
                  <span className="contact-link-item__arrow">↗</span>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Availability badge */}
          <motion.div
            className="contact-avail glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="contact-avail__dot" />
            <p className="contact-avail__text">
              <span>Currently available</span> for Freelance, Collaboration and Full Time Jobs
            </p>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  )
}
