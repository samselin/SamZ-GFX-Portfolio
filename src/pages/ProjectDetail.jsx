// src/pages/ProjectDetail.jsx
import { useEffect, useRef, useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PageTransition from '../components/PageTransition'
import LiquidImage from '../components/LiquidImage'
import { useProject, useProjects, useAIProjects } from '../hooks/useProjects'
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
  const { projects: portfolioProjects } = useProjects()
  const { projects: aiProjectsList } = useAIProjects()
  const galleryRef = useRef(null)
  const heroRef = useRef(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Determine which scope this project belongs to.
  // 3D portfolio categories are free-text titles ("Product Visualization" etc.);
  // AI Studio categories are strictly "image" or "video".
  const isAIProject = project
    ? project.category === 'image' || project.category === 'video'
    : false
  const projects = isAIProject ? aiProjectsList : portfolioProjects
  const backHref = isAIProject ? '/ai-studio' : '/portfolio'

  const openLightbox = (index) => setLightboxIndex(index)
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const showPrev = useCallback(() =>
    setLightboxIndex(i => (i > 0 ? i - 1 : project?.images?.length - 1)), [project])
  const showNext = useCallback(() =>
    setLightboxIndex(i => (i < project?.images?.length - 1 ? i + 1 : 0)), [project])

  useEffect(() => {
    if (lightboxIndex === null) return
    // Lock page scroll so overlay stays centred on screen
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxIndex, closeLightbox, showPrev, showNext])

  // Find next/prev projects
  const currentIndex = projects.findIndex((p) => String(p.id) === String(id))
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

      // Gallery Image Parallax
      const images = gsap.utils.toArray('.gallery-item img')
      images.forEach((img) => {
        gsap.set(img, { scale: 1.15 })
        gsap.fromTo(img, 
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        )
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
            <LiquidImage className="project-hero__img" src={heroImage} alt={project.title} />
            <div className="project-hero__vignette" />
          </div>
          <div className="project-hero__content container">
            <motion.div
              className="project-hero__meta"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={backHref} className="project-hero__back mono">
                ← {isAIProject ? 'AI Studio' : 'Portfolio'}
              </Link>
              <span className="section-label" style={{ marginTop: '1.5rem' }}>
                {isAIProject
                  ? (project.category === 'video' ? 'AI Video' : 'AI Image')
                  : project.category}
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
              <DetailRow
                label="Category"
                value={isAIProject
                  ? (project.category === 'video' ? 'AI Video' : 'AI Image')
                  : project.category}
              />
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
                    onClick={() => openLightbox(i)}
                    title="Click to view full screen"
                  >
                    <img src={src} alt={`${project.title} render ${i + 1}`} loading="lazy" />
                    <div className="gallery-item__zoom-hint">⤢</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── LIGHTBOX (portal – renders outside framer-motion transforms) ── */}
        {lightboxIndex !== null && ReactDOM.createPortal(
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <button
              className="lightbox-back"
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              aria-label="Close"
            >
              ← Back
            </button>

            <span className="lightbox-counter mono">
              {lightboxIndex + 1} / {project.images.length}
            </span>

            {project.images.length > 1 && (
              <button
                className="lightbox-arrow lightbox-arrow--prev"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            <img
              className="lightbox-img"
              src={project.images[lightboxIndex]}
              alt={`${project.title} fullscreen ${lightboxIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
            />

            {project.images.length > 1 && (
              <button
                className="lightbox-arrow lightbox-arrow--next"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>,
          document.body
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
                <div className="project-nav__preview project-nav__preview--left">
                  <img src={prevProject.thumbnail || prevProject.images?.[0]} alt="" />
                </div>
              </Link>
            ) : <div />}

            {nextProject ? (
              <Link to={`/project/${nextProject.id}`} className="project-nav__link project-nav__link--next">
                <span className="mono">Next →</span>
                <span className="project-nav__name display">{nextProject.title}</span>
                <div className="project-nav__preview project-nav__preview--right">
                  <img src={nextProject.thumbnail || nextProject.images?.[0]} alt="" />
                </div>
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
