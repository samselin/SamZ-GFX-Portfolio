// src/components/AnimatedDivider.jsx
// Same as <div className="divider" /> but draws itself in once it enters the viewport.
import { useEffect, useRef, useState } from 'react'

export default function AnimatedDivider() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  return <div ref={ref} className={`divider ${inView ? 'in-view' : ''}`} aria-hidden="true" />
}