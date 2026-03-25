// src/components/ScrollProgress.jsx
import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setProgress((scrollY / docHeight) * 100)
      } else {
        setProgress(0)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Initial calculate
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '2px',
        background: 'var(--c-white)',
        zIndex: 9999,
        transition: 'width 0.1s ease-out',
        pointerEvents: 'none',
        boxShadow: '0 0 8px rgba(255,255,255,0.4)',
      }}
    />
  )
}
