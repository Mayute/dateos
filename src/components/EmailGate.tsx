import { useState } from 'react'
import { getOrCreateUser, setStoredEmail } from '../lib/userStore'

type Props = {
  onAuthenticated: (email: string) => void
}

export default function EmailGate({ onAuthenticated }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      setError('Enter a valid email.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await getOrCreateUser(email)
      setStoredEmail(email)
      onAuthenticated(email)
    } catch (e: any) {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(12,12,16,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{ background: '#13131a', border: '1px solid rgba(240,237,232,0.09)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
      >
        <h2 className="font-serif text-2xl font-medium mb-2" style={{ color: '#f0ede8' }}>
          Plan your perfect date
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
          Enter your email to get started. Free users get 2 plans.
        </p>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full px-4 py-3 rounded-xl text-sm mb-3"
          style={{
            background: 'rgba(240,237,232,0.06)',
            border: '1px solid rgba(240,237,232,0.1)',
            color: '#f0ede8',
            outline: 'none',
            fontFamily: 'Outfit, sans-serif'
          }}
        />
        {error && (
          <p className="text-sm mb-3" style={{ color: '#e8556a', fontFamily: 'Outfit, sans-serif' }}>
            {error}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
          style={{
            background: '#e8556a',
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}