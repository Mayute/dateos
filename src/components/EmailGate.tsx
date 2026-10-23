import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fetchMe } from '../lib/userStore'

type Props = {
  onAuthenticated: (email: string) => void
}

type Step = 'details' | 'code'

const RESEND_COOLDOWN_SECONDS = 30

export default function EmailGate({ onAuthenticated }: Props) {
  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function handleSendCode() {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName) {
      setError('Enter your name.')
      return
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Enter a valid email.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: { shouldCreateUser: true },
      })
      if (otpError) throw otpError

      setEmail(trimmedEmail)
      setStep('code')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (e: any) {
      setError(e?.message || 'Could not send a code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setLoading(true)
    setError('')
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (otpError) throw otpError
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (e: any) {
      setError(e?.message || 'Could not resend the code.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode() {
    if (code.trim().length < 6) {
      setError('Enter the 6-digit code.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'email',
      })
      if (verifyError) throw verifyError

            // Only reachable after a verified OTP. The server verifies the new session token
      // and creates/loads the user row, so the email can't be spoofed from the browser.
      const me = await fetchMe(name.trim())
      if (!me) throw new Error('Could not start your session. Please try again.')
      onAuthenticated(email)
    } catch (e: any) {
      setError(e?.message === 'Token has expired or is invalid'
        ? 'That code is wrong or expired. Try again or resend.'
        : (e?.message || 'Something went wrong. Try again.'))
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
        {step === 'details' ? (
          <>
            <h2 className="font-serif text-2xl font-medium mb-2" style={{ color: '#f0ede8' }}>
              Plan your perfect date
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
            We'll email a 6-digit code to your address. Your first 5 plans are free, with every feature.
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendCode()}
              className="w-full px-4 py-3 rounded-xl text-sm mb-3"
              style={{
                background: 'rgba(240,237,232,0.06)',
                border: '1px solid rgba(240,237,232,0.1)',
                color: '#f0ede8',
                outline: 'none',
                fontFamily: 'Outfit, sans-serif'
              }}
            />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendCode()}
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
              onClick={handleSendCode}
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
              {loading ? 'Sending code...' : 'Send code →'}
            </button>
          </>
        ) : (
          <>
            <h2 className="font-serif text-2xl font-medium mb-2" style={{ color: '#f0ede8' }}>
              Check your email
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}>
              Enter the 6-digit code we sent to <span style={{ color: 'rgba(240,237,232,0.75)' }}>{email}</span>.
            </p>
            <input
              ref={codeInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
              className="w-full px-4 py-3 rounded-xl text-sm mb-3 tracking-[0.3em] text-center"
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
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity mb-3"
              style={{
                background: '#e8556a',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Verifying...' : 'Verify →'}
            </button>
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStep('details'); setCode(''); setError(''); }}
                className="text-xs"
                style={{ color: 'rgba(240,237,232,0.4)', fontFamily: 'Outfit, sans-serif' }}
              >
                ← Edit email
              </button>
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="text-xs"
                style={{
                  color: cooldown > 0 ? 'rgba(240,237,232,0.3)' : '#e8556a',
                  fontFamily: 'Outfit, sans-serif',
                  cursor: cooldown > 0 ? 'default' : 'pointer'
                }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}