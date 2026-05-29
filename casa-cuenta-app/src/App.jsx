import { useEffect, useState } from 'react'
import { supabase } from './services/supabaseClient'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import ResetPassword from './pages/ResetPassword'
import './App.css'

const RECOVERY_DURATION_MS = 15 * 60 * 1000

const isRecoveryActive = () => {
  const expiresAt = Number(
    localStorage.getItem('password_recovery_expires_at')
  )

  if (!expiresAt) {
    return false
  }

  if (Date.now() > expiresAt) {
    localStorage.removeItem('password_recovery_expires_at')
    return false
  }

  return true
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authView, setAuthView] = useState('login')
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(
    window.location.pathname === '/reset-password' || isRecoveryActive()
  )

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (window.location.pathname === '/reset-password') {
        setIsPasswordRecovery(true)
        setSession(data.session)
        setLoading(false)
        return
      }

      if (isRecoveryActive()) {
        setIsPasswordRecovery(true)

        if (window.location.pathname !== '/reset-password') {
          window.history.replaceState({}, '', '/reset-password')
        }

        setSession(data.session)
        setLoading(false)
        return
      }

      setSession(data.session)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        localStorage.setItem(
          'password_recovery_expires_at',
          String(Date.now() + RECOVERY_DURATION_MS)
        )

        setIsPasswordRecovery(true)
        setSession(currentSession)

        if (window.location.pathname !== '/reset-password') {
          window.history.replaceState({}, '', '/reset-password')
        }

        return
      }

      if (isRecoveryActive()) {
        setIsPasswordRecovery(true)
        setSession(currentSession)

        if (window.location.pathname !== '/reset-password') {
          window.history.replaceState({}, '', '/reset-password')
        }

        return
      }

      setSession(currentSession)
    })

    const handleStorageChange = (event) => {
      if (event.key === 'password_recovery_expires_at' && isRecoveryActive()) {
        setIsPasswordRecovery(true)

        if (window.location.pathname !== '/reset-password') {
          window.location.href = '/reset-password'
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (isPasswordRecovery) {
    return <ResetPassword />
  }

  if (!session) {
    if (authView === 'register') {
      return (
        <Register
          onLogin={setSession}
          onGoToLogin={() => setAuthView('login')}
        />
      )
    }

    if (authView === 'forgot-password') {
      return (
        <ForgotPassword
          onGoToLogin={() => setAuthView('login')}
        />
      )
    }

    return (
      <Login
        onLogin={setSession}
        onGoToRegister={() => setAuthView('register')}
        onGoToForgotPassword={() => setAuthView('forgot-password')}
      />
    )
  }

  return <Dashboard session={session} />
}

export default App