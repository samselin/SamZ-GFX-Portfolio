// src/pages/ProjectDetail.jsx
import { useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PageTransition from '../components/PageTransition'
import { useProject, useProjects } from '../hooks/useProjects'
import { fadeUp, stagger } from '../animations/variants'
import './ProjectDetail.css'

gsap.registerPlugin(ScrollTrigger)

const BREAKDOWN_STAGES = [
  { label: 'Modeling', desc: 'Base mesh construction, topology flow, and geometric detail work.' },
  { label: 'Texturing', desc: 'PBR material authoring, UV mapping, and surface detail painting.' },
  { label: 'Lighting', desc: 'HDRI environment, area lights, and mood-defining light placement.' },
  { label: 'Rendering', desc: 'Cycles / EEVEE render pass setup, noise reduction, and compositing.' },
]

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { project, loading } = useProject(id)
  const { projects } = useProjects()
  const galleryRef = useRef(null)
  const heroRef = useRef(null)

  // Find next/prev projects
  const currentIndex = projects.findIndex((p) => p.id === id)
  const prevProject = projects[currentIndex - 1] || null
  const nextProject = projects[currentIndex + 1] || null

  // GSAP: parallax hero image on scroll
  useEffect(() => {
    if (!heroRef.current) return
    const ctx = gsap.context(() => {
      gsap.to('.project-hero__img', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.project-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Gallery stagger reveal
      gsap.from('.gallery-item', {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.project-gallery',
          start: 'top 80%',
        },
      })

      // Breakdown reveal
      gsap.from('.breakdown-item', {
        opacity: 0,
        x: -30,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.project-breakdown',
          start: 'top 80%',
        },
      })
    })
    return () => ctx.revert()
  }, [project])

  if (loading) {
    return (
      <div className="project-loading">
        <div className="project-loading__bar" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-not-found page container">
        <h1 className="display">Project not found.</h1>
        <Link to="/portfolio" className="btn btn-ghost" style={{ marginTop: '2rem' }}>
          ← Back to Portfolio
        </Link>
      </div>
    )
  }

  const heroImage = project.images?.[0] || project.thumbnail

  return (
    <PageTransition>
      <div className="project-detail" ref={heroRef}>

        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section className="project-hero">
          <div className="project-hero__media">
            <img
              className="project-hero__img"
              src={heroImage}
              alt={project.title}
            />
            <div className="project-hero__vignette" />
          </div>
          <div className="project-hero__content container">
            <motion.div
              className="project-hero__meta"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/portfolio" className="project-hero__back mono">
                ← Portfolio
              </Link>
              <span className="section-label" style={{ marginTop: '1.5rem' }}>
                {project.category}
              </span>
              <h1 className="project-hero__title display">{project.title}</h1>
            </motion.div>
          </div>
        </section>

        {/* ─── PROJECT INFO ──────────────────────────────────────────── */}
        <section className="section project-info">
          <div className="container project-info__grid">
            {/* Description */}
            <motion.div
              className="project-info__desc"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p>{project.description}</p>
            </motion.div>

            {/* Details */}
            <motion.div
              className="project-info__details"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <DetailRow label="Category" value={project.category} />
              <DetailRow label="Year" value={project.year} />
              <DetailRow label="Software" value={project.software?.join(', ')} />
            </motion.div>
          </div>
        </section>

        <div className="divider" />

        {/* ─── IMAGE GALLERY ─────────────────────────────────────────── */}
        {project.images?.length > 0 && (
          <section className="section project-gallery" ref={galleryRef}>
            <div className="container">
              <span className="section-label">Gallery</span>
              <div className="gallery-grid">
                {project.images.map((src, i) => (
                  <div
                    key={i}
                    className={`gallery-item ${i === 0 ? 'gallery-item--hero' : ''}`}
                  >
                    <img src={src} alt={`${project.title} render ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="divider" />

        {/* ─── BREAKDOWN ─────────────────────────────────────────────── */}
        {project.breakdowns && project.breakdowns.length > 0 && (
          <section className="section project-breakdown">
            <div className="container">
              <span className="section-label">Process</span>
              <h2 className="section-title display" style={{ marginBottom: 'var(--space-2xl)' }}>
                Breakdown
              </h2>
              <div className="breakdown-grid">
                {project.breakdowns.map((stage, i) => (
                  <div key={i} className="breakdown-item">
                    <span className="mono breakdown-item__num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="breakdown-item__label display">{stage.label}</h3>
                    <p className="breakdown-item__desc">{stage.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── SOFTWARE USED ─────────────────────────────────────────── */}
        {project.software?.length > 0 && (
          <>
            <div className="divider" />
            <section className="section project-software">
              <div className="container">
                <span className="section-label">Tools Used</span>
                <div className="software-list">
                  {project.software.map((s) => (
                    <motion.div
                      key={s}
                      className="software-badge"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {s}
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ─── TURNTABLE VIDEO ───────────────────────────────────────── */}
        {project.video && (
          <>
            <div className="divider" />
            <section className="section project-video">
              <div className="container">
                <span className="section-label">Turntable</span>
                <div className="project-video__wrap">
                  {project.video.includes('youtube') || project.video.includes('vimeo') || project.video.includes('drive.google') ? (
                    <iframe
                      src={project.video}
                      title="Project video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={project.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      controlsList="nodownload"
                    />
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        <div className="divider" />

        {/* ─── NEXT / PREV NAVIGATION ────────────────────────────────── */}
        <nav className="project-nav">
          <div className="container project-nav__inner">
            {prevProject ? (
              <Link to={`/project/${prevProject.id}`} className="project-nav__link project-nav__link--prev">
                <span className="mono">← Previous</span>
                <span className="project-nav__name display">{prevProject.title}</span>
              </Link>
            ) : <div />}

            {nextProject ? (
              <Link to={`/project/${nextProject.id}`} className="project-nav__link project-nav__link--next">
                <span className="mono">Next →</span>
                <span className="project-nav__name display">{nextProject.title}</span>
              </Link>
            ) : <div />}
          </div>
        </nav>

      </div>
    </PageTransition>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="mono detail-row__label">{label}</span>
      <span className="detail-row__value">{value}</span>
    </div>
  )
}
