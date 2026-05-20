import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function FamilyPanel({ profile }) {
  const [family, setFamily] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadFamily = async () => {
      if (!profile.family_id) {
        return
      }

      const { data, error } = await supabase
        .from('families')
        .select('id, name, invite_code')
        .eq('id', profile.family_id)
        .single()

      if (error) {
        console.error(error)
        setErrorMessage('No se pudo cargar la información de la familia.')
        return
      }

      setFamily(data)
    }

    loadFamily()
  }, [profile.family_id])

  if (!profile.family_id || profile.role !== 'family_admin') {
    return null
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>
  }

  if (!family) {
    return <p>Cargando familia...</p>
  }

  return (
    <div className="create-family-card">
      <h2>{family.name}</h2>
      <p>Código para invitar miembros:</p>

      <div className="invite-code-box">
        <strong>{family.invite_code}</strong>
      </div>

      <p>
        Comparte este código con un usuario sin familia para que pueda unirse.
      </p>
    </div>
  )
}

FamilyPanel.propTypes = {
  profile: PropTypes.shape({
    family_id: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
}

export default FamilyPanel