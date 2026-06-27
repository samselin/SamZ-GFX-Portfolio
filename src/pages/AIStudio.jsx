// src/pages/AIStudio.jsx
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import { useAIProjects } from '../hooks/useProjects'
import './AIStudio.css'

const FILTERS = [
  { id: 'all',   label: 'All' },
  { id: 'image', label: 'AI Images' },
  { id: 'video', label: 'AI Videos' },
]

export default function AIStudio() {
  const trackRef = useRef(null)
  const { projects, loading } = useAIProjects()
  const [filter, setFilter] = useState('all')

  const visible = useMemo(() => {
    if (filter === 'all') return projects
    return projects.filter((p) => p.category === filter)
  }, [projects, filter])

  // Mouse wheel → horizontal scroll (same interaction as Portfolio page)
  const handleWheel = (e) => {
    const track = trackRef.current
    if (!track) return
    e.preventDefault()
    track.scrollLeft += e.deltaY * 1.5
  }

  return (
    <PageTransition>
      <div className="ai-studio">

        {/* ─── HEADER (matches Portfolio + About page hero) ──────── */}
        <div className="ai-studio__header container">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            AI Studio
          </motion.span>
          <motion.h1
            className="ai-studio__title display"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Generative
            <br />
            <span className="ai-studio__title--outline">Works.</span>
          </motion.h1>
          <motion.p
            className="ai-studio__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Scroll horizontally to explore →
          </motion.p>
        </div>

        {/* ─── FILTER BAR (matches existing button + mono aesthetic) ── */}
        <div className="container ai-studio__filter-inner">
          <div className="ai-studio__filter" role="tablist" aria-label="AI Studio categories">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={`ai-studio__filter-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                <span className="mono">{f.label}</span>
              </button>
            ))}
          </div>
          <span className="mono ai-studio__count">
            {String(visible.length).padStart(2, '0')} {visible.length === 1 ? 'work' : 'works'}
          </span>
        </div>

        {/* ─── HORIZONTAL SCROLL TRACK (mirrors Portfolio page) ───── */}
        <div
          className="h-scroll-track"
          ref={trackRef}
          onWheel={handleWheel}
        >
          {loading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="h-card h-card--loading" />
              ))
            : visible.length === 0
              ? (
                <div className="ai-studio__empty">
                  <span className="mono">No projects in this category yet.</span>
                </div>
              )
              : visible.map((project, i) => (
                <HorizontalAICard key={project.id} project={project} index={i} />
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

function HorizontalAICard({ project, index }) {
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

  const displayCategory = project.category === 'video' ? 'AI Video' : 'AI Image'

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
          <span className="h-card__category mono">{displayCategory}</span>
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