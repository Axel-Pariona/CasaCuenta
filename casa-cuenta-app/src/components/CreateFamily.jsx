import { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function CreateFamily({ profile, onFamilyCreated }) {
  const [familyName, setFamilyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleCreateFamily = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!familyName.trim()) {
      setErrorMessage('Ingresa un nombre para la familia.')
      setLoading(false)
      return
    }

    if (profile.family_id) {
      setErrorMessage('Este usuario ya pertenece a una familia.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.rpc(
      'create_family_with_defaults',
      {
        family_name_input: familyName.trim(),
      }
    )

    if (error) {
      setErrorMessage(error.message || 'No se pudo crear la familia.')
      setLoading(false)
      return
    }

    const createdFamily = data?.[0]

    setSuccessMessage(
      `Familia creada correctamente. Código: ${createdFamily?.invite_code}`
    )
    setFamilyName('')
    setLoading(false)

    onFamilyCreated()
  }

  if (profile.family_id) {
    return null
  }

  return (
    <div className="create-family-card">
      <h2>Crear familia</h2>
      <p>
        Crea una familia para administrar gastos familiares e invitar miembros.
      </p>

      <form onSubmit={handleCreateFamily} className="create-family-form">
        <label>Nombre de la familia</label>
        <input
          type="text"
          placeholder="Ejemplo: Familia Pariona"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          required
        />

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creando familia...' : 'Crear familia'}
        </button>
      </form>
    </div>
  )
}

CreateFamily.propTypes = {
  profile: PropTypes.shape({
    family_id: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  onFamilyCreated: PropTypes.func.isRequired,
}

export default CreateFamily