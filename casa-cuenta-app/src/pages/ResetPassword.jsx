import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const prepareRecoverySession = async () => {
      setCheckingSession(true)
      setErrorMessage('')

      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          setErrorMessage(
            'El enlace de recuperación expiró o ya no es válido. Solicita uno nuevo.'
          )
          setHasRecoverySession(false)
          setCheckingSession(false)
          return
        }

        window.history.replaceState({}, '', '/reset-password')
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        setErrorMessage('No se pudo validar la sesión de recuperación.')
        setHasRecoverySession(false)
        setCheckingSession(false)
        return
      }

      if (!session) {
        setErrorMessage(
          'El enlace de recuperación expiró o ya no es válido. Solicita uno nuevo.'
        )
        setHasRecoverySession(false)
        setCheckingSession(false)
        return
      }

      setHasRecoverySession(true)
      setCheckingSession(false)
    }

    prepareRecoverySession()
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!hasRecoverySession) {
      setErrorMessage(
        'El enlace de recuperación expiró o ya no es válido. Solicita uno nuevo.'
      )
      setLoading(false)
      return
    }

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
      setErrorMessage(error.message || 'No se pudo actualizar la contraseña.')
      setLoading(false)
      return
    }

    setSuccessMessage(
      'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
    )
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

        {checkingSession && <span>Validando enlace de recuperación...</span>}

        {!checkingSession && (
          <form onSubmit={handleUpdatePassword}>
            <label>Nueva contraseña</label>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={!hasRecoverySession}
            />

            <label>Confirmar contraseña</label>
            <input
              type="password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!hasRecoverySession}
            />

            {errorMessage && <span className="error">{errorMessage}</span>}
            {successMessage && <span className="success">{successMessage}</span>}

            <button type="submit" disabled={loading || !hasRecoverySession}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}

        <button
          type="button"
          className="switch-mode-button"
          onClick={handleCancelRecovery}
          disabled={loading}
        >
          Cancelar y volver al login
        </button>
      </div>
    </div>
  )
}

export default ResetPassword