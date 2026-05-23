import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function SummaryCards({ session, refresh, profile }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true)
      setErrorMessage('')

      let query = supabase
        .from('expenses')
        .select(`
          id,
          user_id,
          family_id,
          amount,
          expense_date,
          payment_method,
          categories (
            name
          ),
          profiles (
            full_name
          )
        `)

      if (profile.system_role === 'admin') {
        // Admin global ve todo.
      } else if (profile.role === 'family_admin') {
        query = query.eq('family_id', profile.family_id)
      } else {
        query = query.eq('user_id', session.user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
        setErrorMessage('No se pudo cargar el resumen.')
        setLoading(false)
        return
      }

      setExpenses(data || [])
      setLoading(false)
    }

    loadSummary()
  }, [session.user.id, refresh, profile])

  const formatCurrency = (amount) => {
    return `S/ ${Number(amount).toFixed(2)}`
  }

  const getLocalDateString = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const getMonthKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  const getExpenseMonthKey = (expenseDate) => {
    if (!expenseDate) return ''

    const date = new Date(`${expenseDate}T00:00:00`)
    return getMonthKey(date)
  }

  const getTopItem = (items, labelGetter) => {
    const totals = {}

    items.forEach((expense) => {
      const label = labelGetter(expense) || 'Sin dato'

      if (!totals[label]) {
        totals[label] = 0
      }

      totals[label] += Number(expense.amount)
    })

    const sorted = Object.entries(totals)
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total)

    return sorted[0] || null
  }

  const summary = useMemo(() => {
    const today = new Date()
    const todayString = getLocalDateString(today)

    const currentMonthKey = getMonthKey(today)

    const previousMonthDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    )

    const previousMonthKey = getMonthKey(previousMonthDate)

    const currentMonthExpenses = expenses.filter(
      (expense) => getExpenseMonthKey(expense.expense_date) === currentMonthKey
    )

    const previousMonthExpenses = expenses.filter(
      (expense) => getExpenseMonthKey(expense.expense_date) === previousMonthKey
    )

    const todayExpenses = expenses.filter(
      (expense) => expense.expense_date === todayString
    )

    const totalCurrentMonth = currentMonthExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    )

    const totalPreviousMonth = previousMonthExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    )

    const totalToday = todayExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    )

    const daysPassed = today.getDate()
    const dailyAverage =
      daysPassed > 0 ? totalCurrentMonth / daysPassed : totalCurrentMonth

    const topCategory = getTopItem(
      currentMonthExpenses,
      (expense) => expense.categories?.name || 'Sin categoría'
    )

    const topPaymentMethod = getTopItem(
      currentMonthExpenses,
      (expense) => expense.payment_method || 'Sin método'
    )

    const topUser = getTopItem(
      currentMonthExpenses,
      (expense) => expense.profiles?.full_name || 'Sin usuario'
    )

    let comparisonText = 'Sin datos del mes anterior'

    if (totalPreviousMonth > 0) {
      const difference = totalCurrentMonth - totalPreviousMonth
      const percentage = (difference / totalPreviousMonth) * 100

      if (difference > 0) {
        comparisonText = `Subió ${percentage.toFixed(1)}%`
      } else if (difference < 0) {
        comparisonText = `Bajó ${Math.abs(percentage).toFixed(1)}%`
      } else {
        comparisonText = 'Se mantuvo igual'
      }
    } else if (totalCurrentMonth > 0) {
      comparisonText = 'Sin gastos el mes anterior'
    }

    return {
      totalCurrentMonth,
      totalToday,
      currentMonthCount: currentMonthExpenses.length,
      topCategory,
      dailyAverage,
      topPaymentMethod,
      topUser,
      comparisonText,
    }
  }, [expenses])

  if (loading) {
    return <p>Cargando resumen...</p>
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>
  }

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <span>Total del mes</span>
        <strong>{formatCurrency(summary.totalCurrentMonth)}</strong>
      </div>

      <div className="summary-card">
        <span>Total de hoy</span>
        <strong>{formatCurrency(summary.totalToday)}</strong>
      </div>

      <div className="summary-card">
        <span>Gastos del mes</span>
        <strong>{summary.currentMonthCount}</strong>
      </div>

      <div className="summary-card">
        <span>Categoría con más gasto</span>
        <strong>
          {summary.topCategory
            ? summary.topCategory.label
            : 'Sin datos'}
        </strong>
        {summary.topCategory && (
          <small>{formatCurrency(summary.topCategory.total)}</small>
        )}
      </div>

      <div className="summary-card">
        <span>Promedio diario del mes</span>
        <strong>{formatCurrency(summary.dailyAverage)}</strong>
      </div>

      <div className="summary-card">
        <span>Método más usado</span>
        <strong>
          {summary.topPaymentMethod
            ? summary.topPaymentMethod.label
            : 'Sin datos'}
        </strong>
        {summary.topPaymentMethod && (
          <small>{formatCurrency(summary.topPaymentMethod.total)}</small>
        )}
      </div>

      <div className="summary-card">
        <span>Usuario con mayor gasto</span>
        <strong>
          {summary.topUser ? summary.topUser.label : 'Sin datos'}
        </strong>
        {summary.topUser && (
          <small>{formatCurrency(summary.topUser.total)}</small>
        )}
      </div>

      <div className="summary-card">
        <span>Comparación con mes anterior</span>
        <strong>{summary.comparisonText}</strong>
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
  profile: PropTypes.shape({
    family_id: PropTypes.string,
    role: PropTypes.string.isRequired,
    system_role: PropTypes.string.isRequired,
  }).isRequired,
}

export default SummaryCards