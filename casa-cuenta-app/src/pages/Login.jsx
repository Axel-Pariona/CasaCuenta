import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import AuthLayout from '../components/auth/AuthLayout'

function Login({ onLogin, onGoToRegister, onGoToForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const blockedMessage = sessionStorage.getItem('login_message')

    if (blockedMessage) {
      setErrorMessage(blockedMessage)
      sessionStorage.removeItem('login_message')
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_active')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error(profileError)
      sessionStorage.setItem(
        'login_message',
        'No se pudo validar el estado de la cuenta.'
      )

      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (!profileData.is_active) {
      sessionStorage.setItem(
        'login_message',
        'Cuenta desactivada. Comuníquese con el administrador.'
      )

      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    onLogin(data.session)
    setLoading(false)
  }

  return (
    <AuthLayout
      title="CasaCuenta"
      description="Control de gastos familiares"
    >
      <form onSubmit={handleLogin}>
        <label>Correo electrónico</label>
        <input
          type="email"
          placeholder="ejemplo@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMessage && <span className="error">{errorMessage}</span>}
        {successMessage && <span className="success">{successMessage}</span>}

        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>

      <button
        type="button"
        className="switch-mode-button"
        onClick={onGoToRegister}
      >
        No tengo cuenta, crear una
      </button>

      <button
        type="button"
        className="switch-mode-button"
        onClick={onGoToForgotPassword}
      >
        Olvidé mi contraseña
      </button>
    </AuthLayout>
  )
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onGoToRegister: PropTypes.func.isRequired,
  onGoToForgotPassword: PropTypes.func.isRequired,
}

export default Login