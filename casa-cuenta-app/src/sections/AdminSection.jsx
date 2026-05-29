import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import DashboardSection from '../components/layout/DashboardSection'

function AdminSection({ profile }) {
  const [users, setUsers] = useState([])
  const [families, setFamilies] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [statusFilter, setStatusFilter] = useState('all')
  const [systemRoleFilter, setSystemRoleFilter] = useState('all')
  const [familyRoleFilter, setFamilyRoleFilter] = useState('all')

  useEffect(() => {
    loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.system_role])

  const loadAdminData = async () => {
    if (profile.system_role !== 'admin') {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        system_role,
        role,
        family_id,
        is_active,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      setErrorMessage('No se pudieron cargar los usuarios.')
      setLoading(false)
      return
    }

    const { data: familiesData, error: familiesError } = await supabase
      .from('families')
      .select(`
        id,
        name,
        invite_code,
        is_active,
        created_at,
        deleted_at
      `)
      .order('created_at', { ascending: false })

    if (familiesError) {
      setErrorMessage('No se pudieron cargar las familias.')
      setLoading(false)
      return
    }

    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select(`
        id,
        user_id,
        family_id,
        amount,
        expense_date,
        created_at
      `)

    if (expensesError) {
      setErrorMessage('No se pudieron cargar los gastos globales.')
      setLoading(false)
      return
    }

    setUsers(usersData || [])
    setFamilies(familiesData || [])
    setExpenses(expensesData || [])
    setLoading(false)
  }

  const handleSetUserActive = async (user, nextActiveValue) => {
    const actionText = nextActiveValue ? 'reactivar' : 'desactivar'

    const confirmed = window.confirm(
      `¿Seguro que deseas ${actionText} la cuenta de ${user.full_name || user.email || 'este usuario'}?`
    )

    if (!confirmed) {
      return
    }

    setActionLoadingId(user.id)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.rpc('admin_set_user_active', {
      target_user_id: user.id,
      active_input: nextActiveValue,
    })

    if (error) {      
      setErrorMessage(error.message || 'No se pudo actualizar la cuenta.')
      setActionLoadingId('')
      return
    }

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id
          ? { ...currentUser, is_active: nextActiveValue }
          : currentUser
      )
    )

    setSuccessMessage(
      nextActiveValue
        ? 'Cuenta reactivada correctamente.'
        : 'Cuenta desactivada correctamente.'
    )

    setActionLoadingId('')
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return '-'

    return new Date(dateValue).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatCurrency = (amount) => {
    return `S/ ${Number(amount).toFixed(2)}`
  }

  const getFamilyName = (familyId) => {
    if (!familyId) return 'Sin familia'

    const family = families.find((item) => item.id === familyId)
    return family?.name || 'Familia no encontrada'
  }

  const getFamilyMemberCount = (familyId) => {
    return users.filter((user) => user.family_id === familyId).length
  }

  const getFamilyTotalSpent = (familyId) => {
    return expenses
      .filter((expense) => expense.family_id === familyId)
      .reduce((sum, expense) => sum + Number(expense.amount), 0)
  }

  const getUserTotalSpent = (userId) => {
    return expenses
      .filter((expense) => expense.user_id === userId)
      .reduce((sum, expense) => sum + Number(expense.amount), 0)
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active)

      const matchesSystemRole =
        systemRoleFilter === 'all' || user.system_role === systemRoleFilter

      const matchesFamilyRole =
        familyRoleFilter === 'all' || user.role === familyRoleFilter

      return matchesStatus && matchesSystemRole && matchesFamilyRole
    })
  }, [users, statusFilter, systemRoleFilter, familyRoleFilter])

  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.is_active).length
  const inactiveUsers = users.filter((user) => !user.is_active).length

  const totalFamilies = families.length
  const activeFamilies = families.filter((family) => family.is_active).length
  const inactiveFamilies = families.filter((family) => !family.is_active).length

  const totalExpenses = expenses.length
  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  if (profile.system_role !== 'admin') {
    return (
      <DashboardSection
        title="Administración"
        description="No tienes permisos para acceder a esta sección."
      >
        <div className="placeholder-card">
          <h2>Acceso restringido</h2>
          <p>Solo el administrador general puede ver este panel.</p>
        </div>
      </DashboardSection>
    )
  }

  if (loading) {
    return (
      <DashboardSection
        title="Panel de administración"
        description="Cargando información global del sistema."
      >
        <p>Cargando datos administrativos...</p>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection
      title="Panel de administración"
      description="Monitorea usuarios, familias y gastos registrados en CasaCuenta."
    >
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="admin-summary-grid">
        <div className="admin-summary-card">
          <span>Total de usuarios</span>
          <strong>{totalUsers}</strong>
        </div>

        <div className="admin-summary-card">
          <span>Cuentas activas</span>
          <strong>{activeUsers}</strong>
        </div>

        <div className="admin-summary-card">
          <span>Cuentas inactivas</span>
          <strong>{inactiveUsers}</strong>
        </div>

        <div className="admin-summary-card">
          <span>Total de familias</span>
          <strong>{totalFamilies}</strong>
          <small>
            Activas: {activeFamilies} / Inactivas: {inactiveFamilies}
          </small>
        </div>

        <div className="admin-summary-card">
          <span>Total de gastos</span>
          <strong>{totalExpenses}</strong>
        </div>

        <div className="admin-summary-card">
          <span>Total gastado global</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </div>
      </div>

      <div className="admin-card">
        <h2>Familias registradas</h2>

        {families.length === 0 ? (
          <p>No hay familias registradas.</p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Estado</th>
                  <th>Miembros</th>
                  <th>Total gastado</th>
                  <th>Código</th>
                  <th>Creada el</th>
                </tr>
              </thead>

              <tbody>
                {families.map((family) => (
                  <tr key={family.id}>
                    <td>{family.name}</td>
                    <td>
                      <span
                        className={
                          family.is_active
                            ? 'admin-status-badge active'
                            : 'admin-status-badge inactive'
                        }
                      >
                        {family.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>{getFamilyMemberCount(family.id)}</td>
                    <td>{formatCurrency(getFamilyTotalSpent(family.id))}</td>
                    <td>{family.invite_code || '-'}</td>
                    <td>{formatDate(family.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Usuarios registrados</h2>
            <p>
              Filtra cuentas por estado, rol global o rol familiar. También
              puedes activar o desactivar cuentas.
            </p>
          </div>
        </div>

        <div className="admin-filters-grid">
          <div>
            <label>Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div>
            <label>Rol global</label>
            <select
              value={systemRoleFilter}
              onChange={(e) => setSystemRoleFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div>
            <label>Rol familiar</label>
            <select
              value={familyRoleFilter}
              onChange={(e) => setFamilyRoleFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="family_admin">Family admin</option>
              <option value="member">Member</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p>No hay usuarios que coincidan con los filtros.</p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol global</th>
                  <th>Rol familiar</th>
                  <th>Familia</th>
                  <th>Estado</th>
                  <th>Total gastado</th>
                  <th>Creado el</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === profile.id
                  const isActionLoading = actionLoadingId === user.id

                  return (
                    <tr key={user.id}>
                      <td>{user.full_name || 'Sin nombre'}</td>
                      <td>{user.email || '-'}</td>
                      <td>{user.system_role}</td>
                      <td>{user.role}</td>
                      <td>{getFamilyName(user.family_id)}</td>
                      <td>
                        <span
                          className={
                            user.is_active
                              ? 'admin-status-badge active'
                              : 'admin-status-badge inactive'
                          }
                        >
                          {user.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>{formatCurrency(getUserTotalSpent(user.id))}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className="admin-actions-cell">
                          {user.is_active ? (
                            <button
                              type="button"
                              className="admin-danger-button"
                              onClick={() => handleSetUserActive(user, false)}
                              disabled={isCurrentUser || isActionLoading}
                            >
                              {isActionLoading ? 'Procesando...' : 'Desactivar'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-success-button"
                              onClick={() => handleSetUserActive(user, true)}
                              disabled={isCurrentUser || isActionLoading}
                            >
                              {isActionLoading ? 'Procesando...' : 'Reactivar'}
                            </button>
                          )}

                          {isCurrentUser && (
                            <small className="admin-self-note">
                              Tu cuenta
                            </small>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardSection>
  )
}

AdminSection.propTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    system_role: PropTypes.string.isRequired,
  }).isRequired,
}

export default AdminSection