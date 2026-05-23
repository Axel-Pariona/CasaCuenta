import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import '../styles/auth.css'

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Completa todos los campos.')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error(error)
      setErrorMessage(error.message || 'No se pudo actualizar la contraseña.')
      setLoading(false)
      return
    }

    setSuccessMessage('Contraseña actualizada correctamente. Ya puedes iniciar sesión.')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)

    setTimeout(async () => {
      localStorage.removeItem('password_recovery_expires_at')
      await supabase.auth.signOut()
      window.location.href = '/'
    }, 2000)
  }

  const handleCancelRecovery = async () => {
    localStorage.removeItem('password_recovery_expires_at')
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CasaCuenta</h1>
        <p>Crear nueva contraseña</p>

        <form onSubmit={handleUpdatePassword}>
          <label>Nueva contraseña</label>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label>Confirmar contraseña</label>
          <input
            type="password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {errorMessage && <span className="error">{errorMessage}</span>}
          {successMessage && <span className="success">{successMessage}</span>}

          <button type="submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
        <button
          type="button"
          className="switch-mode-button"
          onClick={handleCancelRecovery}
        >
          Cancelar y volver al login
        </button>
      </div>
    </div>
  )
}

export default ResetPassword