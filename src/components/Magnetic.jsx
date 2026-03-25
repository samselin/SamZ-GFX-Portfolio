// src/components/Magnetic.jsx
import { useRef, useEffect, cloneElement } from 'react'
import { gsap } from 'gsap'

export default function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' })

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const { width, height, left, top } = el.getBoundingClientRect()
      const x = (clientX - (left + width / 2)) * strength
      const y = (clientY - (top + height / 2)) * strength
      xTo(x)
      yTo(y)
    }

    const handleMouseLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [strength])

  return cloneElement(children, { ref })
}
