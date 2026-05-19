import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function ExpenseTable({ session, refresh, filters }) {
  const [expenses, setExpenses] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true)
      setErrorMessage('')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, family_id, full_name')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        setErrorMessage('No se pudo cargar el perfil del usuario.')
        setLoading(false)
        return
      }

      setProfile(profileData)

      let query = supabase
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
            full_name
          )
        `)
        .eq('family_id', profileData.family_id)

      if (filters.startDate) {
        query = query.gte('expense_date', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('expense_date', filters.endDate)
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod)
      }

      if (filters.search.trim() !== '') {
        query = query.ilike('description', `%${filters.search.trim()}%`)
      }

      const { data: expensesData, error: expensesError } = await query
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (expensesError) {
        console.error(expensesError)
        setErrorMessage('No se pudieron cargar los gastos.')
        setLoading(false)
        return
      }

      setExpenses(expensesData)
      setLoading(false)
    }

    loadExpenses()
  }, [session.user.id, refresh, filters])

  if (loading) {
    return <p>Cargando gastos...</p>
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>
  }

  return (
    <div className="expense-table-card">
      <h2>Gastos registrados</h2>

      {expenses.length === 0 ? (
        <p>No hay gastos que coincidan con los filtros.</p>
      ) : (
        <div className="table-container">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Método</th>
                <th>Monto</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.expense_date}</td>
                  <td>{expense.profiles?.full_name || 'Sin usuario'}</td>
                  <td>{expense.categories?.name || 'Sin categoría'}</td>
                  <td>{expense.description || '-'}</td>
                  <td>{expense.payment_method}</td>
                  <td>S/ {Number(expense.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {profile && (
        <p className="table-note">
          Mostrando gastos de la familia del usuario: <strong>{profile.full_name}</strong>
        </p>
      )}
    </div>
  )
}

ExpenseTable.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  refresh: PropTypes.number.isRequired,
  filters: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    categoryId: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
}

export default ExpenseTable