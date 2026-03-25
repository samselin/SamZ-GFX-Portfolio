// src/components/CustomCursor.jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './CustomCursor.css'

export default function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return

    const cursor = cursorRef.current
    if (!cursor) return

    // Hide system cursor
    document.documentElement.classList.add('custom-cursor-active')

    // Center the cursor blob at the mouse coordinates
    gsap.set(cursor, { xPercent: -50, yPercent: -50 })

    // QuickSetters for high performance mouse tracking
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.2, ease: 'power3.out' })
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.2, ease: 'power3.out' })

    const onMove = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }

    const onEnter = () => cursor.classList.add('cursor-blob--hover')
    const onLeave = () => cursor.classList.remove('cursor-blob--hover')

    const addListeners = () => {
      // Find interactive elements and attach hover effects
      document.querySelectorAll('a, button, [role="button"], .gallery-item, .project-card, input, textarea, .lightbox-arrow, .lightbox-back').forEach(el => {
        // Prevent duplicate bound listeners
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    
    // Initial listener bind
    // Small timeout ensures the DOM has fully painted
    setTimeout(addListeners, 100)

    // Re-bind listeners when the DOM tree changes (e.g., navigating pages or opening lightbox)
    const obs = new MutationObserver(addListeners)
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      obs.disconnect()
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [])

  return (
    <div ref={cursorRef} className="cursor-blob" aria-hidden="true" />
  )
}
