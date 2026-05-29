import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

const getTodayDate = () => {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function ExpenseForm({ session, onExpenseCreated }) {
  const [profile, setProfile] = useState(null)
  const [categories, setCategories] = useState([])

  const [expenseDate, setExpenseDate] = useState(getTodayDate())
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadProfileAndCategories = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, family_id, full_name')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        setErrorMessage('No se pudo cargar el perfil del usuario.')
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
        setErrorMessage('No se pudieron cargar las categorías.')
        return
      }

      setCategories(categoriesData)

      if (categoriesData.length > 0) {
        setCategoryId(categoriesData[0].id)
      }
    }

    loadProfileAndCategories()
  }, [session.user.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMessage('')

    if (!profile) {
      setErrorMessage('No se encontró el perfil del usuario.')
      setLoading(false)
      return
    }

    if (!categoryId) {
      setErrorMessage('Selecciona una categoría.')
      setLoading(false)
      return
    }

    if (Number(amount) <= 0) {
      setErrorMessage('El monto debe ser mayor a 0.')
      setLoading(false)
      return
    }

    const newExpense = {
      family_id: profile.family_id,
      user_id: session.user.id,
      category_id: categoryId,
      expense_date: expenseDate,
      amount: Number(amount),
      description,
      payment_method: paymentMethod,
    }

    const { error } = await supabase
      .from('expenses')
      .insert([newExpense])

    if (error) {
      setErrorMessage('No se pudo registrar el gasto.')
      setLoading(false)
      return
    }

    setMessage('Gasto registrado correctamente.')
    setAmount('')
    setDescription('')
    setPaymentMethod('Efectivo')
    setExpenseDate(getTodayDate())

    if (onExpenseCreated) {
      onExpenseCreated()
    }

    setLoading(false)
  }

  return (
    <div className="expense-form-card">
      <h2>Registrar gasto</h2>

      <form onSubmit={handleSubmit} className="expense-form">
        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Monto</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ejemplo: 25.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Método de pago</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label>Descripción</label>
          <input
            type="text"
            placeholder="Ejemplo: Almuerzo, pasaje, mercado..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {message && <p className="success-message">{message}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar gasto'}
        </button>
      </form>
    </div>
  )
}

ExpenseForm.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onExpenseCreated: PropTypes.func,
}

export default ExpenseForm