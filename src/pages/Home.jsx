// src/pages/Home.jsx
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useInView } from 'react-intersection-observer'
import WireframeSphere from '../components/WireframeSphere'
import PageTransition from '../components/PageTransition'
import ProjectCard from '../components/ProjectCard'
import { useProjects } from '../hooks/useProjects'
import { getResumeUrl } from '../supabase/storage'
import { fadeUp, stagger } from '../animations/variants'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

// ─── SOFTWARE SKILLS ─────────────────────────────────────────────────────────
const SKILLS = [
  { name: 'Blender', icon: '⬡', desc: '3D Modeling, Animation & Rendering' },
  { name: 'After Effects', icon: '◈', desc: 'Motion & Compositing' },
  { name: 'Photoshop', icon: '◻', desc: 'Photo Editing & Matte' },
  { name: 'DaVinci Resolve', icon: '◉', desc: 'Color Grading & Edit' },
  { name: 'CapCut', icon: '▷', desc: 'Social Video & Reels' },
]

// ─── CONTACT LINKS ────────────────────────────────────────────────────────────
const CONTACTS = [
  { label: 'Email', href: 'mailto:samzgfx8@gmail.com', icon: '✉' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/s-am-selin', icon: '↗' },
  { label: 'Instagram', href: 'https://www.instagram.com/samz_gfx?igsh=NjNhOGM5N3o3Zzc3', icon: '◻' },
  { label: 'YouTube', href: 'https://www.youtube.com/@SamzGfx', icon: '▷' },
]

// ─── YOUTUBE URL PARSER ───────────────────────────────────────────────────────
function parseYouTubeUrl(url) {
  if (!url) return { id: null, isShort: false }
  const isShort = url.includes('shorts/')
  let id = null
  const patterns = [
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) { id = match[1]; break }
  }
  return { id, isShort }
}

// ─── SHOWREEL EMBED ───────────────────────────────────────────────────────────
function ShowreelEmbed({ url }) {
  const { id, isShort } = parseYouTubeUrl(url)
  if (!id) return null

  const embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&rel=0&modestbranding=1`

  return (
    <div className={`showreel__video-wrap ${isShort ? 'showreel__video-wrap--portrait' : 'showreel__video-wrap--landscape'}`}>
      <iframe
        src={embedUrl}
        title="Showreel"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

// ─── ANIMATED SECTION ─────────────────────────────────────────────────────────
function AnimatedSection({ children, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const heroRef = useRef(null)
  const bgRef = useRef(null)
  const titleRef = useRef(null)
  const { projects, loading } = useProjects()

  // Mouse parallax
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const onMouseMove = (e) => {
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth - 0.5) * 30
      const y = (e.clientY / innerHeight - 0.5) * 20
      if (bgRef.current) {
        bgRef.current.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px) scale(1.08)`
      }
      if (titleRef.current) {
        titleRef.current.style.transform = `translate(${x * 0.06}px, ${y * 0.06}px)`
      }
    }
    hero.addEventListener('mousemove', onMouseMove)
    return () => hero.removeEventListener('mousemove', onMouseMove)
  }, [])

  // GSAP scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.skill-item', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.skills-section',
          start: 'top 80%',
        },
      })
      gsap.from('.about-preview__image', {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-preview',
          start: 'top 75%',
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <PageTransition>
      <div className="home">

        {/* ─── HERO ──────────────────────────────────────────────────────── */}
        <section className="hero" ref={heroRef}>
          <div className="hero__bg" ref={bgRef}>
            <div className="hero__orb hero__orb--1" />
            <div className="hero__orb hero__orb--2" />
            <div className="hero__orb hero__orb--3" />
          </div>

          {/* Eyebrow */}
          <div className="hero__content">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hero__eyebrow section-label"
            >
              3D Modelling · Animation
            </motion.div>
          </div>

          {/* Title + Sphere */}
          <div className="hero__middle">
            <div ref={titleRef} className="hero__title-wrap">
              <motion.h1
                className="hero__name display"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                Samz
                <br />
                <span className="hero__name--outline">G F X</span>
              </motion.h1>
            </div>

            <motion.div
              className="hero__sphere"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <WireframeSphere />
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div className="hero__bottom">
            <motion.p
              className="hero__tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              Crafting visuals beyond dimensions
            </motion.p>

            <motion.div
              className="hero__actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/portfolio" className="btn btn-primary">
                View Portfolio
              </Link>
              <a href="#showreel" className="btn btn-ghost">
                ▷ &nbsp;Watch Showreel
              </a>
              <a href={getResumeUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                📄 &nbsp;Resume
              </a>
            </motion.div>
          </div>

          <motion.div
            className="hero__scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="hero__scroll-line" />
            <span className="mono">Scroll</span>
          </motion.div>
        </section>

        {/* ─── FEATURED WORKS ────────────────────────────────────────────── */}
        <section className="section featured-works">
          <div className="container">
            <AnimatedSection>
              <div className="section-header">
                <motion.span className="section-label" variants={fadeUp} custom={0}>
                  Selected Works
                </motion.span>
                <motion.h2 className="section-title display" variants={fadeUp} custom={0.1}>
                  Featured Projects
                </motion.h2>
              </div>

              {loading ? (
                <div className="loading-grid">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="loading-card" />
                  ))}
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.slice(0, 6).map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
                </div>
              )}

              <motion.div className="featured-works__cta" variants={fadeUp} custom={0.3}>
                <Link to="/portfolio" className="btn btn-ghost">
                  View All Work →
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        <div className="divider" />

        {/* ─── SKILLS ────────────────────────────────────────────────────── */}
        <section className="section skills-section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Tools & Software</span>
              <h2 className="section-title display">The Toolkit</h2>
            </div>
            <div className="skills-grid">
              {SKILLS.map((skill) => (
                <div key={skill.name} className="skill-item">
                  <div className="skill-item__icon">{skill.icon}</div>
                  <div>
                    <h3 className="skill-item__name">{skill.name}</h3>
                    <p className="skill-item__desc">{skill.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ─── ABOUT PREVIEW ─────────────────────────────────────────────── */}
        <section className="section about-preview">
          <div className="container about-preview__inner">
            <div className="about-preview__text">
              <span className="section-label">About</span>
              <h2 className="section-title display">
                Driven by
                <br />
                Craft.
              </h2>
              <p className="about-preview__body">
                I'm a 3D Generalist and visual storyteller from India, pursuing a career
                in the intersection of art and technology. With a background in Computer
                Science from JP College of Engineering and a passion for 3D/VFX, I create worlds
                that exist beyond the physical plane.
              </p>
              <Link to="/about" className="btn btn-ghost" style={{ marginTop: '2rem' }}>
                Learn More →
              </Link>
            </div>
            <div className="about-preview__image">
              <div className="about-preview__img-wrap">
                <img
                  src="https://i.ibb.co/M4hwYSB/1000367963.jpg"
                  alt="Samz GFX — 3D artist"
                  loading="lazy"
                />
              </div>
              <div className="about-preview__tag glass">
                <span className="mono">Available for work</span>
                <div className="about-preview__dot" />
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ─── SHOWREEL ──────────────────────────────────────────────────── */}
        <section className="section showreel-section" id="showreel">
          <div className="container">
            <AnimatedSection>
              <div className="section-header center">
                <motion.span className="section-label" variants={fadeUp} custom={0}>
                  Showreel
                </motion.span>
                <motion.h2 className="section-title display" variants={fadeUp} custom={0.1}>
                  The Reel
                </motion.h2>
              </div>
            </AnimatedSection>

            {/* ← Change this URL anytime — auto-detects portrait or landscape */}
            <ShowreelEmbed url="https://youtube.com/shorts/p_tXP5Hdjh0?feature=share" />
          </div>
        </section>

        <div className="divider" />

        {/* ─── CONTACT CTA ───────────────────────────────────────────────── */}
        <section className="section contact-cta">
          <div className="container">
            <AnimatedSection className="contact-cta__inner">
              <motion.span className="section-label" variants={fadeUp} custom={0}>
                Get In Touch
              </motion.span>
              <motion.h2 className="display contact-cta__headline" variants={fadeUp} custom={0.1}>
                Let's Create
                <br />
                Something
                <br />
                <span className="contact-cta__outline">Extraordinary.</span>
              </motion.h2>

              <motion.div className="contact-cta__links" variants={fadeUp} custom={0.25}>
                {CONTACTS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="contact-link"
                  >
                    <span className="contact-link__icon">{icon}</span>
                    <span>{label}</span>
                    <span className="contact-link__arrow">↗</span>
                  </a>
                ))}
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* ─── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="footer">
          <div className="container footer__inner">
            <p className="mono footer__copy">
              © {new Date().getFullYear()} Samz GFX · All rights reserved
            </p>
            <p className="mono footer__made">
              Crafted with intent
            </p>
          </div>
        </footer>

      </div>
    </PageTransition>
  )
}