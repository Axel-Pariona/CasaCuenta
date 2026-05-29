import { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function JoinFamily({ profile, onFamilyJoined }) {
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleJoinFamily = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!inviteCode.trim()) {
      setErrorMessage('Ingresa un código de invitación.')
      setLoading(false)
      return
    }

    if (profile.family_id) {
      setErrorMessage('Este usuario ya pertenece a una familia.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.rpc('join_family_by_code', {
      invite_code_input: inviteCode.trim().toUpperCase(),
    })

    if (error) {  
      setErrorMessage(error.message || 'No se pudo unir a la familia.')
      setLoading(false)
      return
    }

    const joinedFamily = data?.[0]

    setSuccessMessage(`Te uniste a ${joinedFamily?.family_name}.`)
    setInviteCode('')
    setLoading(false)

    onFamilyJoined()
  }

  if (profile.family_id) {
    return null
  }

  return (
    <div className="create-family-card">
      <h2>Unirme a una familia</h2>
      <p>
        Ingresa el código que te compartió el administrador familiar.
      </p>

      <form onSubmit={handleJoinFamily} className="create-family-form">
        <label>Código de invitación</label>
        <input
          type="text"
          placeholder="Ejemplo: FAM-A1B2C3"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
        />

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Uniendo...' : 'Unirme a familia'}
        </button>
      </form>
    </div>
  )
}

JoinFamily.propTypes = {
  profile: PropTypes.shape({
    family_id: PropTypes.string,
  }).isRequired,
  onFamilyJoined: PropTypes.func.isRequired,
}

export default JoinFamily