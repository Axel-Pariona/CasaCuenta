import { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import AuthLayout from '../components/auth/AuthLayout'

function ForgotPassword({ onGoToLogin }) {
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handlePasswordResetRequest = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!resetEmail.trim()) {
      setErrorMessage('Ingresa tu correo electrónico.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      resetEmail.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )

    if (error) {
      setErrorMessage(error.message || 'No se pudo enviar el correo de recuperación.')
      setLoading(false)
      return
    }

    setSuccessMessage('Te enviamos un enlace para recuperar tu contraseña.')
    setResetEmail('')
    setLoading(false)
  }

  return (
    <AuthLayout
      title="CasaCuenta"
      description="Recupera tu contraseña"
    >
      <form onSubmit={handlePasswordResetRequest}>
        <label>Correo electrónico</label>
        <input
          type="email"
          placeholder="ejemplo@gmail.com"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
        />

        {errorMessage && <span className="error">{errorMessage}</span>}
        {successMessage && <span className="success">{successMessage}</span>}

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      <button
        type="button"
        className="switch-mode-button"
        onClick={onGoToLogin}
      >
        Volver al inicio de sesión
      </button>
    </AuthLayout>
  )
}

ForgotPassword.propTypes = {
  onGoToLogin: PropTypes.func.isRequired,
}

export default ForgotPassword