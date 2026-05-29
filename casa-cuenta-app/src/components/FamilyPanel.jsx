import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function FamilyPanel({ profile, onFamilyUpdated }) {
  const [family, setFamily] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadFamilyPanel = async () => {
      if (!profile.family_id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMessage('')

      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('id, name, invite_code, created_at')
        .eq('id', profile.family_id)
        .single()

      if (familyError) {
        console.error(familyError)
        setErrorMessage('No se pudo cargar la información de la familia.')
        setLoading(false)
        return
      }

      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          created_at,
          joined_family_at
        `)
        .eq('family_id', profile.family_id)
        .order('role', { ascending: true })
        .order('full_name', { ascending: true })

      if (membersError) {
        console.error(membersError)
        setErrorMessage('No se pudieron cargar los miembros de la familia.')
        setLoading(false)
        return
      }

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('user_id, amount')
        .eq('family_id', profile.family_id)

      if (expensesError) {
        console.error(expensesError)
        setErrorMessage('No se pudo calcular el gasto por miembro.')
        setLoading(false)
        return
      }

      const totalsByUser = {}

      expensesData.forEach((expense) => {
        if (!totalsByUser[expense.user_id]) {
          totalsByUser[expense.user_id] = 0
        }

        totalsByUser[expense.user_id] += Number(expense.amount)
      })

      const membersWithTotals = membersData.map((member) => ({
        ...member,
        totalSpent: totalsByUser[member.id] || 0,
      }))

      setFamily(familyData)
      setMembers(membersWithTotals)
      setLoading(false)
    }

    loadFamilyPanel()
  }, [profile.family_id])

  const handleDissolveFamily = async () => {
    const confirmed = window.confirm(
      '¿Seguro que deseas disolver esta familia? Todos los miembros saldrán de la familia, las categorías familiares se desactivarán y los gastos antiguos se conservarán como historial.'
    )

    if (!confirmed) {
      return
    }

    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.rpc('dissolve_my_family')

    if (error) {
      console.error(error)
      setErrorMessage(error.message || 'No se pudo disolver la familia.')
      setLoading(false)
      return
    }

    setLoading(false)

    if (onFamilyUpdated) {
      onFamilyUpdated()
    }
  }

  const handleLeaveFamily = async () => {
    const confirmed = window.confirm(
      '¿Seguro que deseas salir de esta familia? Dejarás de compartir gastos con este grupo, pero tus gastos anteriores se conservarán.'
    )

    if (!confirmed) {
      return
    }

    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.rpc('leave_my_family')

    if (error) {
      console.error(error)
      setErrorMessage(error.message || 'No se pudo salir de la familia.')
      setLoading(false)
      return
    }

    setLoading(false)

    if (onFamilyUpdated) {
      onFamilyUpdated()
    }
  }

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return '-'
    }

    return new Date(dateValue).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (!profile.family_id) {
    return null
  }

  if (loading) {
    return <p>Cargando familia...</p>
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>
  }

  if (!family) {
    return <p>No se encontró información de la familia.</p>
  }

  return (
    <div className="family-panel">
      <div className="family-info-card">
        <div>
          <h2>{family.name}</h2>
          <p>
            {profile.role === 'family_admin'
              ? 'Administra la información principal de tu familia.'
              : 'Consulta la información principal de tu familia.'}
          </p>
        </div>

        <div className="family-stats-grid">
          <div className="family-stat-item">
            <span>Miembros</span>
            <strong>{members.length}</strong>
          </div>

          <div className="family-stat-item">
            <span>Total gastado</span>
            <strong>
              S/{' '}
              {members
                .reduce((sum, member) => sum + member.totalSpent, 0)
                .toFixed(2)}
            </strong>
          </div>

          <div className="family-stat-item">
            <span>Creada el</span>
            <strong>{formatDate(family.created_at)}</strong>
          </div>
        </div>

        <div className="invite-code-section">
          <p>Código para invitar miembros:</p>

          <div className="invite-code-box">
            <strong>{family.invite_code}</strong>
          </div>

          <p>
            Comparte este código con un usuario sin familia para que pueda
            unirse.
          </p>
        </div>
      </div>

<div className="family-members-card">
        <h2>Miembros de la familia</h2>

        {members.length === 0 ? (
          <p>No hay miembros registrados en esta familia.</p>
        ) : (
          <div className="family-members-table-container">
            <table className="family-members-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Fecha de unión</th>
                  <th>Total gastado</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.full_name || 'Sin nombre'}</td>
                    <td>{member.email || '-'}</td>
                    <td>{member.role}</td>
                    <td>
                      {formatDate(member.joined_family_at || member.created_at)}
                    </td>
                    <td>S/ {member.totalSpent.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {profile.role === 'member' && (
        <div className="family-danger-zone">
          <h3>Salir de la familia</h3>
          <p>
            Si sales de la familia, dejarás de compartir gastos con este grupo.
            Tus gastos anteriores se conservarán.
          </p>

          <button
            type="button"
            className="family-warning-button"
            onClick={handleLeaveFamily}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Salir de familia'}
          </button>
        </div>
      )}

      {profile.role === 'family_admin' && (
        <div className="family-danger-zone">
          <h3>Disolver familia</h3>
          <p>
            Si disuelves la familia, todos los miembros quedarán sin familia y las
            categorías familiares se desactivarán.
          </p>

          <button
            type="button"
            className="family-danger-button"
            onClick={handleDissolveFamily}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Disolver familia'}
          </button>
        </div>
      )}
    </div>
  )
}

FamilyPanel.propTypes = {
  profile: PropTypes.shape({
    family_id: PropTypes.string,
    role: PropTypes.string.isRequired,
  }).isRequired,
  onFamilyUpdated: PropTypes.func,
}

export default FamilyPanel