import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function SummaryCards({ session, refresh }) {
  const [summary, setSummary] = useState({
    totalMonth: 0,
    totalToday: 0,
    totalExpenses: 0,
    topCategory: 'Sin datos',
  })

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true)
      setErrorMessage('')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, family_id, full_name')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        setErrorMessage('No se pudo cargar el perfil para los resúmenes.')
        setLoading(false)
        return
      }

      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth()

      const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
        .toISOString()
        .split('T')[0]

      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
        .toISOString()
        .split('T')[0]

      const todayDate = today.toISOString().split('T')[0]

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          expense_date,
          amount,
          categories (
            name
          )
        `)
        .eq('family_id', profileData.family_id)
        .gte('expense_date', firstDayOfMonth)
        .lte('expense_date', lastDayOfMonth)

      if (expensesError) {
        console.error(expensesError)
        setErrorMessage('No se pudieron cargar los resúmenes.')
        setLoading(false)
        return
      }

      const totalMonth = expensesData.reduce((sum, expense) => {
        return sum + Number(expense.amount)
      }, 0)

      const totalToday = expensesData
        .filter((expense) => expense.expense_date === todayDate)
        .reduce((sum, expense) => {
          return sum + Number(expense.amount)
        }, 0)

      const totalExpenses = expensesData.length

      const categoryTotals = {}

      expensesData.forEach((expense) => {
        const categoryName = expense.categories?.name || 'Sin categoría'

        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = 0
        }

        categoryTotals[categoryName] += Number(expense.amount)
      })

      let topCategory = 'Sin datos'
      let topAmount = 0

      Object.entries(categoryTotals).forEach(([category, amount]) => {
        if (amount > topAmount) {
          topCategory = category
          topAmount = amount
        }
      })

      setSummary({
        totalMonth,
        totalToday,
        totalExpenses,
        topCategory,
      })

      setLoading(false)
    }

    loadSummary()
  }, [session.user.id, refresh])

  if (loading) {
    return (
      <div className="summary-grid">
        <div className="summary-card">
          <p>Cargando resúmenes...</p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>
  }

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <span>Total del mes</span>
        <strong>S/ {summary.totalMonth.toFixed(2)}</strong>
      </div>

      <div className="summary-card">
        <span>Total de hoy</span>
        <strong>S/ {summary.totalToday.toFixed(2)}</strong>
      </div>

      <div className="summary-card">
        <span>Gastos registrados del mes</span>
        <strong>{summary.totalExpenses}</strong>
      </div>

      <div className="summary-card">
        <span>Categoría con más gasto</span>
        <strong>{summary.topCategory}</strong>
      </div>
    </div>
  )
}

SummaryCards.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  refresh: PropTypes.number.isRequired,
}

export default SummaryCards