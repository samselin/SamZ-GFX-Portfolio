// src/pages/Portfolio.jsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import { useProjects } from '../hooks/useProjects'
import './Portfolio.css'

export default function Portfolio() {
  const trackRef = useRef(null)
  const { projects, loading } = useProjects()

  // Mouse wheel → horizontal scroll
  const handleWheel = (e) => {
    const track = trackRef.current
    if (!track) return
    e.preventDefault()
    track.scrollLeft += e.deltaY * 1.5
  }

  return (
    <PageTransition>
      <div className="portfolio-page">

        {/* Header */}
        <div className="portfolio-header container">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Portfolio
          </motion.span>
          <motion.h1
            className="portfolio-title display"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            All Work
          </motion.h1>
          <motion.p
            className="portfolio-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Scroll horizontally to explore →
          </motion.p>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          className="h-scroll-track"
          ref={trackRef}
          onWheel={handleWheel}
        >
          {loading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="h-card h-card--loading" />
              ))
            : projects.map((project, i) => (
                <HorizontalCard key={project.id} project={project} index={i} />
              ))
          }
        </div>

        {/* Scroll hint bar */}
        <div className="h-scroll-hint container">
          <span className="mono">← Drag or scroll to navigate →</span>
        </div>

      </div>
    </PageTransition>
  )
}

function HorizontalCard({ project, index }) {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -6
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 6
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`
    card.style.setProperty('--gx', `${(x / rect.width) * 100}%`)
    card.style.setProperty('--gy', `${(y / rect.height) * 100}%`)
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)'
  }

  return (
    <motion.div
      className="h-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/project/${project.id}`}
        className="h-card__link"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <span className="h-card__num mono">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="h-card__thumb">
          <img
            src={project.thumbnail || project.images?.[0]}
            alt={project.title}
            loading="lazy"
            draggable="false"
          />
          <div className="h-card__glow" />
          <div className="h-card__img-overlay">
            <span className="h-card__view-cta mono">Open →</span>
          </div>
        </div>

        <div className="h-card__info">
          <span className="h-card__category mono">{project.category}</span>
          <h2 className="h-card__title display">{project.title}</h2>
          <div className="h-card__software">
            {project.software?.map((s) => (
              <span key={s} className="h-card__tag">{s}</span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}