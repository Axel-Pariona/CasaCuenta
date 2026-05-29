import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function ExpenseTable({ session, refresh, filters, onExpenseChanged }) {
  const [expenses, setExpenses] = useState([])
  const [profile, setProfile] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [editingExpenseId, setEditingExpenseId] = useState(null)

  const [editForm, setEditForm] = useState({
    expense_date: '',
    amount: '',
    category_id: '',
    description: '',
    payment_method: '',
  })

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true)
      setErrorMessage('')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, family_id, full_name, role, system_role')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        setErrorMessage('No se pudo cargar el perfil del usuario.')
        setLoading(false)
        return
      }

      setProfile(profileData)

      let categoriesQuery = supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (profileData.family_id) {
        categoriesQuery = categoriesQuery.eq('family_id', profileData.family_id)
      } else {
        categoriesQuery = categoriesQuery.is('family_id', null)
      }

      const { data: categoriesData, error: categoriesError } = await categoriesQuery

      if (categoriesError) {
        console.error(categoriesError)
        setErrorMessage('No se pudieron cargar las categorías.')
        setLoading(false)
        return
      }

      setCategories(categoriesData)

      let query = supabase
        .from('expenses')
        .select(`
          id,
          expense_date,
          amount,
          description,
          payment_method,
          category_id,
          categories (
            name
          ),
          profiles (
            full_name
          )
        `)
<<<<<<< HEAD
        .eq('user_id', session.user.id)
=======

      if (profileData.system_role === 'admin') {
        // sin filtro por familia ni usuario
      } else if (profileData.role === 'family_admin') {
        query = query.eq('family_id', profileData.family_id)
      } else {
        query = query.eq('user_id', session.user.id)
      }
>>>>>>> fb3ff5bdd1794c39d5c889e838797275bce57a31

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

  const handleEditClick = (expense) => {
    setEditingExpenseId(expense.id)

    setEditForm({
      expense_date: expense.expense_date,
      amount: expense.amount,
      category_id: expense.category_id,
      description: expense.description || '',
      payment_method: expense.payment_method,
    })
  }

  const handleCancelEdit = () => {
    setEditingExpenseId(null)

    setEditForm({
      expense_date: '',
      amount: '',
      category_id: '',
      description: '',
      payment_method: '',
    })
  }

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUpdateExpense = async (expenseId) => {
    if (Number(editForm.amount) <= 0) {
      alert('El monto debe ser mayor a 0.')
      return
    }

    const { error } = await supabase
      .from('expenses')
      .update({
        expense_date: editForm.expense_date,
        amount: Number(editForm.amount),
        category_id: editForm.category_id,
        description: editForm.description,
        payment_method: editForm.payment_method,
      })
      .eq('id', expenseId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error(error)
      alert('No se pudo actualizar el gasto.')
      return
    }

    setEditingExpenseId(null)
    onExpenseChanged()
  }

  const handleDeleteExpense = async (expenseId) => {
    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar este gasto?'
    )

    if (!confirmDelete) {
      return
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', session.user.id)

    if (error) {
      console.error(error)
      alert('No se pudo eliminar el gasto.')
      return
    }

    onExpenseChanged()
  }

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
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  {editingExpenseId === expense.id ? (
                    <>
                      <td>
                        <input
                          type="date"
                          value={editForm.expense_date}
                          onChange={(e) =>
                            handleEditFormChange('expense_date', e.target.value)
                          }
                        />
                      </td>

                      <td>{expense.profiles?.full_name || 'Sin usuario'}</td>

                      <td>
                        <select
                          value={editForm.category_id}
                          onChange={(e) =>
                            handleEditFormChange('category_id', e.target.value)
                          }
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) =>
                            handleEditFormChange('description', e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <select
                          value={editForm.payment_method}
                          onChange={(e) =>
                            handleEditFormChange('payment_method', e.target.value)
                          }
                        >
                          <option value="Efectivo">Efectivo</option>
                          <option value="Yape">Yape</option>
                          <option value="Plin">Plin</option>
                          <option value="Tarjeta">Tarjeta</option>
                          <option value="Transferencia">Transferencia</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </td>

                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.amount}
                          onChange={(e) =>
                            handleEditFormChange('amount', e.target.value)
                          }
                        />
                      </td>

                      <td className="actions-cell">
                        <button
                          className="save-button"
                          onClick={() => handleUpdateExpense(expense.id)}
                        >
                          Guardar
                        </button>

                        <button
                          className="cancel-button"
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{expense.expense_date}</td>
                      <td>{expense.profiles?.full_name || 'Sin usuario'}</td>
                      <td>{expense.categories?.name || 'Sin categoría'}</td>
                      <td>{expense.description || '-'}</td>
                      <td>{expense.payment_method}</td>
                      <td>S/ {Number(expense.amount).toFixed(2)}</td>

                      <td className="actions-cell">
                        <button
                          className="edit-button"
                          onClick={() => handleEditClick(expense)}
                        >
                          Editar
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {profile && (
        <p className="table-note">
          <>
            Mostrando solo los gastos registrados por:{' '}
            <strong>{profile.full_name}</strong>
          </>
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
  onExpenseChanged: PropTypes.func.isRequired,
}

export default ExpenseTable