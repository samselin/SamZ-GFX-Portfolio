// src/pages/About.jsx
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import KineticMarquee from '../components/KineticMarquee'
import PageTransition from '../components/PageTransition'
import { getResumeUrl } from '../supabase/storage'
import { fadeUp, stagger } from '../animations/variants'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

const SKILLS = [
  { name: 'Blender', level: 78 },
  { name: 'After Effects', level: 55 },
  { name: 'Photoshop', level: 60 },
  { name: 'DaVinci Resolve', level: 75 },
  { name: 'CapCut', level: 90 },
]

const TIMELINE = [
  {
    year: '2021',
    title: 'JP College of Engineering',
    desc: 'Began B.E. Computer Science & Engineering. Continued 3D as a passion project.',
  },
  {
    year: '2022',
    title: 'Discovered 3D',
    desc: 'Started learning Blender independently, fascinated by procedural textures and modeling.',
  },
  {
    year: '2024',
    title: 'Internship',
    desc: 'Completed an internship at Beebox Studios at IITMRP. Learned about Modelling and Animation for AR/VR app',
  },
  {
    year: '2025',
    title: 'Building the Portfolio',
    desc: 'Expanding into VFX, product visualization, and environmental rendering.',
  },
]

export default function About() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Skill bar animations
      gsap.from('.skill-bar__fill', {
        scaleX: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        transformOrigin: 'left',
        scrollTrigger: {
          trigger: '.skills-bars',
          start: 'top 80%',
        },
      })

      // Timeline items
      gsap.from('.timeline-item', {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.about-timeline',
          start: 'top 80%',
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <PageTransition>
      <div className="about-page page">

        {/* ─── HEADER ──────────────────────────────────────────────── */}
        <section className="section about-hero">
          <div className="container">
            <motion.span
              className="section-label"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              About
            </motion.span>
            <motion.h1
              className="about-title display"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              Crafting worlds
              <br />
              <span className="about-title--outline">from scratch.</span>
            </motion.h1>
          </div>
        </section>

        {/* ─── PROFILE ─────────────────────────────────────────────── */}
        <section className="section about-profile">
          <div className="container about-profile__grid">
            <motion.div
              className="about-profile__image-wrap"
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="https://i.ibb.co/M4hwYSB/1000367963.jpg"
                alt="Sam Selin"
              />
              <div className="about-profile__badge glass">
                <span className="mono">3D Generalist</span>
              </div>
            </motion.div>

            <div className="about-profile__text">
              <motion.p
                className="about-bio"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                Hi, I'm Sam Selin from TamilNadu,India.
                I believe that the most compelling art lives at the boundary between
                the real and the imagined.
              </motion.p>
              <motion.p
                className="about-bio"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                I am a passionate and dedicated 2025 passed out Computer Science student aspiring to become a 3D Artist. With
                a strong creative mindset and a growing foundation in programming languages like Python, C, and Java, I am
                eager to explore opportunities that allow me to bring ideas to life through 3D art and design. I am currently
                looking for a role where I can prove myself, learn from real-world experiences, and grow into the creative
                professional
              </motion.p>
              <motion.p
                className="about-bio"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                My goal is to break into the 3D/VFX industry — creating visuals for film,
                advertising, and interactive media. Every project I take on is a step
                toward mastering the craft.
              </motion.p>

              {/* Education card */}
              <motion.div
                className="about-edu glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="mono about-edu__label">Education</span>
                <h3 className="about-edu__degree">B.E. Computer Science & Engineering</h3>
                <p className="about-edu__school">JP College Of Engineering, Tamil Nadu</p>
              </motion.div>

              {/* Resume Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginTop: '2rem' }}
              >
                <a href={getResumeUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  📄 &nbsp;Download Resume
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ─── SKILLS BARS ─────────────────────────────────────────── */}
        <section className="section skills-bars">
          <div className="container">
            <span className="section-label">Proficiency</span>
            <h2 className="section-title display" style={{ marginBottom: 'var(--space-2xl)' }}>
              Software
            </h2>
            <div className="skill-bars-list">
              {SKILLS.map((skill) => (
                <div key={skill.name} className="skill-bar">
                  <div className="skill-bar__top">
                    <span className="skill-bar__name">{skill.name}</span>
                    <span className="mono skill-bar__pct">{skill.level}%</span>
                  </div>
                  <div className="skill-bar__track">
                    <div
                      className="skill-bar__fill"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ─── TIMELINE ────────────────────────────────────────────── */}
        <section className="section about-timeline">
          <div className="container">
              <span className="section-label">Journey</span>
              <h2 className="section-title display" style={{ marginBottom: 'var(--space-2xl)' }}>
                The Path
              </h2>
            <div className="timeline">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className="timeline-item">
                  <div className="timeline-item__year mono">{item.year}</div>
                  <div className="timeline-item__connector">
                    <div className="timeline-item__dot" />
                    {i < TIMELINE.length - 1 && <div className="timeline-item__line" />}
                  </div>
                  <div className="timeline-item__content">
                    <h3 className="timeline-item__title display">{item.title}</h3>
                    <p className="timeline-item__desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ─── GOALS ───────────────────────────────────────────────── */}
        <section className="section about-goals">
          <div className="container">
            <span className="section-label">Vision</span>
            <h2 className="section-title display">Where I'm Headed</h2>
            <div className="goals-grid">
              {[
                { icon: '◈', title: 'VFX Industry', desc: 'Breaking into feature film and series VFX production.' },
                { icon: '⬡', title: '3D Direction', desc: 'Art directing complex CG campaigns for global brands.' },
                { icon: '◉', title: 'Real-Time 3D', desc: 'Exploring Unreal Engine and interactive real-time rendering.' },
              ].map((goal) => (
                <motion.div
                  key={goal.title}
                  className="goal-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="goal-card__icon">{goal.icon}</span>
                  <h3 className="goal-card__title display">{goal.title}</h3>
                  <p className="goal-card__desc">{goal.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BANNER ────────────────────────────────────────────────── */}
        <KineticMarquee text="VFX • MODELING • LOOKDEV • ANIMATION • " speed={18} />

      </div>
    </PageTransition>
  )
}
