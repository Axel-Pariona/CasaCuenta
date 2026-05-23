import { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function MyAccount({ session, profile, onProfileUpdated }) {
  const familyName = profile.families?.name || 'Sin familia'

  const [isEditingName, setIsEditingName] = useState(false)
  const [fullName, setFullName] = useState(profile.full_name)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [confirmNewEmail, setConfirmNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  const handleUpdateName = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!fullName.trim()) {
      setErrorMessage('El nombre no puede estar vacío.')
      setLoading(false)
      return
    }

    if (fullName.trim().length < 3) {
      setErrorMessage('El nombre debe tener al menos 3 caracteres.')
      setLoading(false)
      return
    }

    const { error } = await supabase.rpc('update_my_name', {
      new_full_name: fullName.trim(),
    })

    if (error) {
      console.error(error)
      setErrorMessage(error.message || 'No se pudo actualizar el nombre.')
      setLoading(false)
      return
    }

    setSuccessMessage('Nombre actualizado correctamente.')
    setIsEditingName(false)
    setLoading(false)

    onProfileUpdated()
  }

  const handleCancelEditName = () => {
    setFullName(profile.full_name)
    setIsEditingName(false)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        setErrorMessage('Completa todos los campos de contraseña.')
        setLoading(false)
        return
    }

    if (newPassword.length < 6) {
        setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.')
        setLoading(false)
        return
    }

    if (newPassword !== confirmNewPassword) {
        setErrorMessage('La nueva contraseña y la confirmación no coinciden.')
        setLoading(false)
        return
    }

    if (currentPassword === newPassword) {
        setErrorMessage('La nueva contraseña no puede ser igual a la actual.')
        setLoading(false)
        return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
    })

    if (loginError) {
        setErrorMessage('La contraseña actual es incorrecta.')
        setLoading(false)
        return
    }

    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (updateError) {
        console.error(updateError)
        setErrorMessage(updateError.message || 'No se pudo cambiar la contraseña.')
        setLoading(false)
        return
    }

    setSuccessMessage('Contraseña actualizada correctamente.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setIsChangingPassword(false)
    setLoading(false)
    }

    const handleChangeEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const cleanNewEmail = newEmail.trim().toLowerCase()
    const cleanConfirmEmail = confirmNewEmail.trim().toLowerCase()
    const currentEmail = session.user.email?.toLowerCase()

    if (!cleanNewEmail || !cleanConfirmEmail || !emailPassword) {
        setErrorMessage('Completa todos los campos.')
        setLoading(false)
        return
    }

    if (cleanNewEmail !== cleanConfirmEmail) {
        setErrorMessage('Los correos no coinciden.')
        setLoading(false)
        return
    }

    if (cleanNewEmail === currentEmail) {
        setErrorMessage('El nuevo correo no puede ser igual al correo actual.')
        setLoading(false)
        return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(cleanNewEmail)) {
        setErrorMessage('Ingresa un correo válido.')
        setLoading(false)
        return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: emailPassword,
    })

    if (loginError) {
        setErrorMessage('La contraseña actual es incorrecta.')
        setLoading(false)
        return
    }

    const { error: updateError } = await supabase.auth.updateUser({
        email: cleanNewEmail,
    })

    if (updateError) {
        console.error(updateError)
        setErrorMessage(updateError.message || 'No se pudo cambiar el correo.')
        setLoading(false)
        return
    }

    setSuccessMessage(
        'Solicitud enviada. Revisa tu correo actual y el nuevo correo para confirmar el cambio.'
    )
    setNewEmail('')
    setConfirmNewEmail('')
    setEmailPassword('')
    setIsChangingEmail(false)
    setLoading(false)
    }

    const handleDeactivateAccount = async () => {
        const confirmDeactivate = window.confirm(
            '¿Seguro que deseas desactivar tu cuenta? Se cerrará tu sesión y no podrás seguir usando la cuenta mientras esté desactivada.'
        )

        if (!confirmDeactivate) {
            return
        }

        setLoading(true)
        setErrorMessage('')
        setSuccessMessage('')

        const { error } = await supabase.rpc('deactivate_my_account')

        if (error) {
            console.error(error)
            setErrorMessage(error.message || 'No se pudo desactivar la cuenta.')
            setLoading(false)
            return
        }

        await supabase.auth.signOut()
        setLoading(false)
        }

  return (
    <div className="account-card">
      <div className="account-info-grid">
        <div className="account-info-item">
          <span>Nombre</span>

          {isEditingName ? (
            <form onSubmit={handleUpdateName} className="account-inline-form">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                required
              />

              <div className="account-inline-actions">
                <button type="submit" disabled={loading} className="account-save-button">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEditName}
                  className="account-cancel-button"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <strong>{profile.full_name}</strong>
          )}
        </div>

        <div className="account-info-item">
          <span>Correo</span>
          <strong>{session.user.email}</strong>
        </div>

        <div className="account-info-item">
          <span>Rol</span>
          <strong>{profile.role}</strong>
        </div>

        <div className="account-info-item">
          <span>Familia</span>
          <strong>{profile.family_id ? familyName : 'Sin familia'}</strong>
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

    {isChangingPassword && (
    <form onSubmit={handleChangePassword} className="account-password-form">
        <h3>Cambiar contraseña</h3>

        <label>Contraseña actual</label>
        <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Ingresa tu contraseña actual"
        required
        />

        <label>Nueva contraseña</label>
        <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Ingresa tu nueva contraseña"
        required
        />

        <label>Confirmar nueva contraseña</label>
        <input
        type="password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        placeholder="Repite tu nueva contraseña"
        required
        />

        <div className="account-inline-actions">
        <button type="submit" className="account-save-button" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>

        <button
            type="button"
            className="account-cancel-button"
            disabled={loading}
            onClick={() => {
            setIsChangingPassword(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
            setErrorMessage('')
            setSuccessMessage('')
            }}
        >
            Cancelar
        </button>
        </div>
    </form>
    )}

    {isChangingEmail && (
    <form onSubmit={handleChangeEmail} className="account-password-form">
        <h3>Cambiar correo</h3>

        <label>Nuevo correo</label>
        <input
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="nuevo@email.com"
        required
        />

        <label>Confirmar nuevo correo</label>
        <input
        type="email"
        value={confirmNewEmail}
        onChange={(e) => setConfirmNewEmail(e.target.value)}
        placeholder="Repite el nuevo correo"
        required
        />

        <label>Contraseña actual</label>
        <input
        type="password"
        value={emailPassword}
        onChange={(e) => setEmailPassword(e.target.value)}
        placeholder="Confirma tu contraseña"
        required
        />

        <div className="account-inline-actions">
        <button type="submit" className="account-save-button" disabled={loading}>
            {loading ? 'Enviando...' : 'Cambiar correo'}
        </button>

        <button
            type="button"
            className="account-cancel-button"
            disabled={loading}
            onClick={() => {
            setIsChangingEmail(false)
            setNewEmail('')
            setConfirmNewEmail('')
            setEmailPassword('')
            setErrorMessage('')
            setSuccessMessage('')
            }}
        >
            Cancelar
        </button>
        </div>
    </form>
    )}

      <div className="account-actions">
        <button
          type="button"
          className="account-action-button"
          onClick={() => setIsEditingName(true)}
          disabled={isEditingName}
        >
          Editar nombre
        </button>

        <button
        type="button"
        className="account-action-button"
        onClick={() => {
            setIsChangingEmail(true)
            setIsChangingPassword(false)
            setIsEditingName(false)
            setErrorMessage('')
            setSuccessMessage('')
        }}
        disabled={isChangingEmail}
        >
        Cambiar correo
        </button>

        <button
            type="button"
            className="account-action-button"
            onClick={() => {
                setIsChangingPassword(true)
                setIsEditingName(false)
                setErrorMessage('')
                setSuccessMessage('')
            }}
            disabled={isChangingPassword}
            >
            Cambiar contraseña
        </button>

        <button
            type="button"
            className="account-danger-button"
            onClick={handleDeactivateAccount}
            disabled={loading}
            >
            {loading ? 'Procesando...' : 'Desactivar cuenta'}
        </button>
      </div>
    </div>
  )
}

MyAccount.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      email: PropTypes.string,
    }).isRequired,
  }).isRequired,
  profile: PropTypes.shape({
    full_name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    family_id: PropTypes.string,
    is_active: PropTypes.bool,
    families: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  onProfileUpdated: PropTypes.func.isRequired,
}

export default MyAccount