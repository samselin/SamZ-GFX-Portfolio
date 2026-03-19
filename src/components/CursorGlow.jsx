// src/components/CursorGlow.jsx
import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow || window.matchMedia('(max-width: 768px)').matches) return

    let raf
    let mouseX = 0
    let mouseY = 0
    let currentX = 0
    let currentY = 0

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      // Lerp for smooth follow
      currentX += (mouseX - currentX) * 0.07
      currentY += (mouseY - currentY) * 0.07
      glow.style.left = `${currentX}px`
      glow.style.top = `${currentY}px`
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div className="cursor-glow" ref={glowRef} aria-hidden="true" />
}
