// src/components/NewsletterSignup.jsx
// Tiny email input that subscribes via Supabase. Used in the home footer.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { subscribe } from '../supabase/newsletter'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | ok | err
  const [message, setMessage] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setStatus('err')
      setMessage('Please enter a valid email.')
      return
    }
    setStatus('submitting')
    try {
      await subscribe(email)
      setStatus('ok')
      setMessage('Subscribed — talk soon.')
      setEmail('')
    } catch (err) {
      setStatus('err')
      setMessage(err.message || 'Subscription failed.')
    }
  }

  return (
    <div className="newsletter">
      <span className="mono newsletter__label">Get notified when I post new work</span>
      <form className="newsletter__form" onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="newsletter__input"
          disabled={status === 'submitting'}
          aria-label="Email address"
        />
        <button
          type="submit"
          className="btn btn-primary newsletter__btn"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? '…' : 'Subscribe →'}
        </button>
      </form>
      {status !== 'idle' && (
        <motion.span
          className={`mono newsletter__msg newsletter__msg--${status}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message}
        </motion.span>
      )}
    </div>
  )
}