import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { clearLocalIdentity } from '../lib/userStore'

/**
 * Tracks the Supabase session. `email` is null when signed out.
 * `ready` is false until the first check finishes, so pages don't flash the wrong state.
 */
export function useSession() {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const e = data.session?.user?.email?.toLowerCase() ?? null
      // Old localStorage-only "logins" have no session behind them: wipe them.
      if (!e) clearLocalIdentity()
      setEmail(e)
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setEmail(session?.user?.email?.toLowerCase() ?? null)
      setReady(true)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { email, ready }
}