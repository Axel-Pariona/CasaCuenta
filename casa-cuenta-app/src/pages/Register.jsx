import { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import AuthLayout from '../components/auth/AuthLayout'
import '../styles/auth.css'

function Register({ onLogin, onGoToLogin }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      onLogin(data.session)
    } else {
      setSuccessMessage(
        'Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.'
      )
    }

    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  return (
    <AuthLayout
      title="CasaCuenta"
      description="Crea tu cuenta para registrar tus gastos"
    >
      <form onSubmit={handleRegister}>
        <label>Nombre completo</label>
        <input
          type="text"
          placeholder="Ejemplo: Axel Pariona"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

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

        <label>Confirmar contraseña</label>
        <input
          type="password"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {errorMessage && <span className="error">{errorMessage}</span>}
        {successMessage && <span className="success">{successMessage}</span>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <button
        type="button"
        className="switch-mode-button"
        onClick={onGoToLogin}
      >
        Ya tengo cuenta, iniciar sesión
      </button>
    </AuthLayout>
  )
}

Register.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onGoToLogin: PropTypes.func.isRequired,
}

export default Register