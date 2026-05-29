import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import DashboardSection from '../components/layout/DashboardSection'

function FamilyExpensesSection({ profile }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadFamilyExpenses = async () => {
      if (profile.role !== 'family_admin') {
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          expense_date,
          amount,
          description,
          payment_method,
          categories (
            name
          ),
          profiles (
            full_name,
            email
          )
        `)
        .eq('family_id', profile.family_id)
        .order('expense_date', { ascending: false })

      if (error) {        
        setErrorMessage('No se pudieron cargar los gastos familiares.')
        setLoading(false)
        return
      }

      setExpenses(data || [])
      setLoading(false)
    }

    loadFamilyExpenses()
  }, [profile.family_id, profile.role])

  const formatCurrency = (amount) => `S/ ${Number(amount).toFixed(2)}`

  const totalFamilySpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  if (profile.role !== 'family_admin') {
    return (
      <DashboardSection
        title="Gastos familiares"
        description="No tienes permisos para ver esta sección."
      >
        <div className="placeholder-card">
          <h2>Acceso restringido</h2>
          <p>Solo el administrador familiar puede monitorear gastos familiares.</p>
        </div>
      </DashboardSection>
    )
  }

  if (loading) {
    return (
      <DashboardSection
        title="Gastos familiares"
        description="Monitorea los gastos registrados por los miembros de tu familia."
      >
        <p>Cargando gastos familiares...</p>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection
      title="Gastos familiares"
      description="Monitorea los gastos de tu familia. Esta sección es solo de lectura."
    >
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="monitor-summary-grid">
        <div className="monitor-summary-card">
          <span>Total familiar</span>
          <strong>{formatCurrency(totalFamilySpent)}</strong>
        </div>

        <div className="monitor-summary-card">
          <span>Cantidad de gastos</span>
          <strong>{expenses.length}</strong>
        </div>
      </div>

      <div className="monitor-card">
        <h2>Listado de gastos familiares</h2>

        {expenses.length === 0 ? (
          <p>No hay gastos familiares registrados.</p>
        ) : (
          <div className="monitor-table-container">
            <table className="monitor-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Categoría</th>
                  <th>Método</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.expense_date}</td>
                    <td>{expense.profiles?.full_name || 'Sin nombre'}</td>
                    <td>{expense.profiles?.email || '-'}</td>
                    <td>{expense.categories?.name || 'Sin categoría'}</td>
                    <td>{expense.payment_method || '-'}</td>
                    <td>{expense.description || '-'}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardSection>
  )
}

FamilyExpensesSection.propTypes = {
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
    family_id: PropTypes.string,
  }).isRequired,
}

export default FamilyExpensesSection