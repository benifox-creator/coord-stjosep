import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loginWithGoogle } from '../services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'error-desconegut'
      if (message === 'domini-no-autoritzat') {
        navigate('/no-autoritzat', { replace: true })
      } else {
        setError('No s\'ha pogut iniciar sessió. Torna-ho a intentar.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: '#861414' }}
          >
            SJ
          </div>
          <h1 className="text-xl font-semibold text-text-main">Col·legi Sant Josep Obrer</h1>
          <p className="text-sm text-gray-500">Coordinació Digital</p>
        </div>

        {user && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-2 text-center">
            Cal reconnectar per accedir a les dades.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center shadow-sm"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {loading ? 'Connectant...' : user ? 'Reconnecta amb Google' : 'Accedeix amb Google'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Accés exclusiu per a comptes @stjosep.org
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}
