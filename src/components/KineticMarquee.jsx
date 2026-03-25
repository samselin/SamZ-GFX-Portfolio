// src/components/KineticMarquee.jsx
import './KineticMarquee.css'

export default function KineticMarquee({ text, speed = 15 }) {
  // Duplicate the text several times to ensure the marquee can loop seamlessly
  // without visual gaps regardless of screen size.
  const repeatedText = Array(12).fill(text)

  return (
    <div className="kinetic-marquee">
      <div className="kinetic-marquee__track" style={{ animationDuration: `${speed}s` }}>
        {repeatedText.map((t, i) => (
          <span key={i} className="kinetic-marquee__text display">
            {t}
          </span>
        ))}
      </div>
      <div className="kinetic-marquee__track" style={{ animationDuration: `${speed}s` }}>
        {repeatedText.map((t, i) => (
          <span key={`dup-${i}`} className="kinetic-marquee__text display">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
