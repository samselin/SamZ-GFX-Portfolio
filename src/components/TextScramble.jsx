// src/components/TextScramble.jsx
import { useState, useEffect } from 'react'

const CHARS = '!<>-_\\\\/[]{}—=+*^?#________'

export default function TextScramble({ text, delay = 0, duration = 800 }) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let frame
    let startTime = null
    let timeout

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const ratio = Math.min(progress / duration, 1)

      let result = ''
      for (let i = 0; i < text.length; i++) {
        // If this character should be revealed
        if (ratio >= (i / text.length)) {
          result += text[i]
        } 
        // If it's still scrambling (but don't scramble spaces)
        else if (text[i] !== ' ') {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        } else {
          result += ' '
        }
      }

      setDisplayText(result)

      if (ratio < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    // Start completely blank
    setDisplayText('')

    // Wait for the delay, then start the scramble
    timeout = setTimeout(() => {
      frame = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [text, delay, duration])

  return <span>{displayText}</span>
}
