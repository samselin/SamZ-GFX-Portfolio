// src/components/ProjectCard.jsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './ProjectCard.css'

export default function ProjectCard({ project, index = 0 }) {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotateX = ((y - cy) / cy) * -8
    const rotateY = ((x - cx) / cx) * 8
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`
    card.style.setProperty('--gx', `${(x / rect.width) * 100}%`)
    card.style.setProperty('--gy', `${(y / rect.height) * 100}%`)
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/project/${project.id}`} className="project-card" aria-label={project.title}>
        <div
          ref={cardRef}
          className="project-card__inner"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Thumbnail */}
          <div className="project-card__thumb">
            <img
              src={project.thumbnail || project.images?.[0]}
              alt={project.title}
              loading="lazy"
            />
            <div className="project-card__glow" />
            <div className="project-card__overlay">
              <span className="project-card__view">View Project →</span>
            </div>
          </div>

          {/* Meta */}
          <div className="project-card__meta">
            <span className="mono project-card__category">{project.category}</span>
            <h3 className="project-card__title">{project.title}</h3>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
