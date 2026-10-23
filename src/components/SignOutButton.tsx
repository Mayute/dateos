import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { signOut } from '../lib/userStore'

/** Renders nothing when signed out. */
export default function SignOutButton() {
  const navigate = useNavigate()
  const { email } = useSession()
  if (!email) return null

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <button
      onClick={handleSignOut}
      title={`Signed in as ${email}`}
      className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-full"
      style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Outfit, sans-serif' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.45)')}
    >
      <LogOut size={14} />
      Sign out
    </button>
  )
}