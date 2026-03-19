// src/components/WireframeSphere.jsx
import { useEffect, useRef } from 'react'
import './WireframeSphere.css'

export default function WireframeSphere() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const size = 420
    canvas.width = size
    canvas.height = size

    const cx = size / 2
    const cy = size / 2
    const radius = 160
    const rings = 12
    const segments = 24
    let angleX = 0
    let angleY = 0
    let animId

    function project([x, y, z]) {
      const fov = 900
      const scale = fov / (fov + z)
      return [cx + x * scale, cy + y * scale, scale]
    }

    function rotateX([x, y, z], a) {
      return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
    }

    function rotateY([x, y, z], a) {
      return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
    }

    function draw() {
      ctx.clearRect(0, 0, size, size)

      const points = []

      // Generate sphere points
      for (let i = 0; i <= rings; i++) {
        const phi = (Math.PI * i) / rings
        for (let j = 0; j <= segments; j++) {
          const theta = (2 * Math.PI * j) / segments
          let p = [
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta),
          ]
          p = rotateX(p, angleX)
          p = rotateY(p, angleY)
          points.push({ p, i, j })
        }
      }

      // Draw latitude lines (rings)
      for (let i = 0; i <= rings; i++) {
        ctx.beginPath()
        let first = true
        for (let j = 0; j <= segments; j++) {
          const pt = points.find((p) => p.i === i && p.j === j)
          if (!pt) continue
          const [px, py, scale] = project(pt.p)
          const alpha = Math.max(0.04, (scale - 0.4) * 0.55)
          ctx.strokeStyle = `rgba(147, 180, 212, ${alpha})`
          ctx.lineWidth = 0.6
          if (first) { ctx.moveTo(px, py); first = false }
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }

      // Draw longitude lines (meridians)
      for (let j = 0; j <= segments; j++) {
        ctx.beginPath()
        let first = true
        for (let i = 0; i <= rings; i++) {
          const pt = points.find((p) => p.i === i && p.j === j)
          if (!pt) continue
          const [px, py, scale] = project(pt.p)
          const alpha = Math.max(0.04, (scale - 0.4) * 0.55)
          ctx.strokeStyle = `rgba(147, 180, 212, ${alpha})`
          ctx.lineWidth = 0.6
          if (first) { ctx.moveTo(px, py); first = false }
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }

      // Draw intersection dots
      for (const { p, i, j } of points) {
        if (i % 2 === 0 && j % 3 === 0) {
          const [px, py, scale] = project(p)
          const alpha = Math.max(0, (scale - 0.5) * 0.8)
          ctx.beginPath()
          ctx.arc(px, py, scale * 1.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(147, 180, 212, ${alpha})`
          ctx.fill()
        }
      }

      angleY += 0.004
      angleX += 0.0015
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="sphere-wrap">
      <div className="sphere-glow" />
      <canvas ref={canvasRef} className="sphere-canvas" />
    </div>
  )
}