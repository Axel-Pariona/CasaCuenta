import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import DashboardSection from '../components/layout/DashboardSection'

function GlobalExpensesSection({ profile }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadGlobalExpenses = async () => {
      if (profile.system_role !== 'admin') {
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
          ),
          families (
            name
          )
        `)
        .order('expense_date', { ascending: false })

      if (error) {
        console.error(error)
        setErrorMessage('No se pudieron cargar los gastos globales.')
        setLoading(false)
        return
      }

      setExpenses(data || [])
      setLoading(false)
    }

    loadGlobalExpenses()
  }, [profile.system_role])

  const formatCurrency = (amount) => `S/ ${Number(amount).toFixed(2)}`

  const totalGlobalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  if (profile.system_role !== 'admin') {
    return (
      <DashboardSection
        title="Gastos globales"
        description="No tienes permisos para ver esta sección."
      >
        <div className="placeholder-card">
          <h2>Acceso restringido</h2>
          <p>Solo el administrador general puede monitorear gastos globales.</p>
        </div>
      </DashboardSection>
    )
  }

  if (loading) {
    return (
      <DashboardSection
        title="Gastos globales"
        description="Monitorea todos los gastos registrados en el sistema."
      >
        <p>Cargando gastos globales...</p>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection
      title="Gastos globales"
      description="Monitorea todos los gastos registrados en CasaCuenta. Esta sección es solo de lectura."
    >
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="monitor-summary-grid">
        <div className="monitor-summary-card">
          <span>Total global</span>
          <strong>{formatCurrency(totalGlobalSpent)}</strong>
        </div>

        <div className="monitor-summary-card">
          <span>Cantidad de gastos</span>
          <strong>{expenses.length}</strong>
        </div>
      </div>

      <div className="monitor-card">
        <h2>Listado global de gastos</h2>

        {expenses.length === 0 ? (
          <p>No hay gastos registrados en el sistema.</p>
        ) : (
          <div className="monitor-table-container">
            <table className="monitor-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Familia</th>
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
                    <td>{expense.families?.name || 'Sin familia'}</td>
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

GlobalExpensesSection.propTypes = {
  profile: PropTypes.shape({
    system_role: PropTypes.string.isRequired,
  }).isRequired,
}

export default GlobalExpensesSection