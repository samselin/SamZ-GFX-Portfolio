// src/components/FloatingShapes.jsx
// Pure CSS-3D floating geometric shapes for the hero section.
// No Three.js / canvas needed — uses perspective transforms only.

const SHAPES = [
  { type: 'cube',   size: 52, x: '12%',  y: '20%', delay: 0,    duration: 18 },
  { type: 'cube',   size: 28, x: '82%',  y: '15%', delay: 3.5,  duration: 22 },
  { type: 'cube',   size: 38, x: '72%',  y: '70%', delay: 1.2,  duration: 20 },
  { type: 'ring',   size: 72, x: '88%',  y: '48%', delay: 0.8,  duration: 14 },
  { type: 'ring',   size: 44, x: '6%',   y: '65%', delay: 2.5,  duration: 17 },
  { type: 'tri',    size: 42, x: '55%',  y: '10%', delay: 1.8,  duration: 19 },
  { type: 'tri',    size: 30, x: '22%',  y: '78%', delay: 4,    duration: 23 },
  { type: 'dot',    size: 10, x: '40%',  y: '22%', delay: 0.5,  duration: 9  },
  { type: 'dot',    size: 7,  x: '67%',  y: '88%', delay: 2,    duration: 11 },
  { type: 'dot',    size: 13, x: '93%',  y: '82%', delay: 1,    duration: 13 },
]

function Cube({ size }) {
  const h = size
  const faceStyle = (transform, bg) => ({
    position: 'absolute',
    width: h,
    height: h,
    background: bg,
    border: '1px solid rgba(255,255,255,0.18)',
    transform,
  })
  const half = h / 2
  return (
    <div style={{ width: h, height: h, position: 'relative', transformStyle: 'preserve-3d' }}>
      {/* front */}  <div style={faceStyle(`translateZ(${half}px)`,            'rgba(255,255,255,0.03)')} />
      {/* back */}   <div style={faceStyle(`rotateY(180deg) translateZ(${half}px)`, 'rgba(255,255,255,0.02)')} />
      {/* left */}   <div style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`, 'rgba(255,255,255,0.02)')} />
      {/* right */}  <div style={faceStyle(`rotateY(90deg) translateZ(${half}px)`,  'rgba(255,255,255,0.04)')} />
      {/* top */}    <div style={faceStyle(`rotateX(90deg) translateZ(${half}px)`,  'rgba(255,255,255,0.05)')} />
      {/* bottom */} <div style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`, 'rgba(255,255,255,0.01)')} />
    </div>
  )
}

function Ring({ size }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.15)',
      boxShadow: 'inset 0 0 20px rgba(255,255,255,0.03), 0 0 20px rgba(255,255,255,0.04)',
      background: 'transparent',
    }} />
  )
}

function Triangle({ size }) {
  return (
    <div style={{
      width: 0, height: 0,
      borderLeft: `${size / 2}px solid transparent`,
      borderRight: `${size / 2}px solid transparent`,
      borderBottom: `${size * 0.866}px solid rgba(255,255,255,0.1)`,
      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.08))',
    }} />
  )
}

function Dot({ size }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.25)',
      boxShadow: '0 0 12px rgba(255,255,255,0.15)',
    }} />
  )
}

export default function FloatingShapes() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        perspective: '900px',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className={`fs-shape fs-shape--${s.type}`}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            transformStyle: 'preserve-3d',
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          {s.type === 'cube' && <Cube size={s.size} />}
          {s.type === 'ring' && <Ring size={s.size} />}
          {s.type === 'tri'  && <Triangle size={s.size} />}
          {s.type === 'dot'  && <Dot size={s.size} />}
        </div>
      ))}
    </div>
  )
}
