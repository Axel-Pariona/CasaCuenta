import { useEffect, useState } from 'react'
import { supabase } from './services/supabaseClient'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import ResetPassword from './pages/ResetPassword'
import './App.css'

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
      const recoveryActive = isRecoveryActive()

      if (window.location.pathname === '/reset-password' && !recoveryActive) {
        await supabase.auth.signOut()
        window.history.replaceState({}, '', '/')
        setIsPasswordRecovery(false)
        setSession(null)
        setLoading(false)
        return
      }

      if (recoveryActive) {
        setIsPasswordRecovery(true)
        setSession(null)

        if (window.location.pathname !== '/reset-password') {
          window.history.replaceState({}, '', '/reset-password')
        }

        setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
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
          String(Date.now() + 5 * 60 * 1000)
        )

        setIsPasswordRecovery(true)
        setSession(null)

        if (window.location.pathname !== '/reset-password') {
          window.history.replaceState({}, '', '/reset-password')
        }

        return
      }

      if (isRecoveryActive()) {
        setIsPasswordRecovery(true)
        setSession(null)

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
        setSession(null)

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

  if (isPasswordRecovery) {
    return <ResetPassword />
  }

  if (loading) {
    return <p>Cargando...</p>
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