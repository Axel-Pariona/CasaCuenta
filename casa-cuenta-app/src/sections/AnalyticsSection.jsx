import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import DashboardSection from '../components/layout/DashboardSection'

function AnalyticsSection({ session, profile }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadAnalyticsData = async () => {
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
        // Admin global ve todo
      } else if (profile.role === 'family_admin') {
        query = query.eq('family_id', profile.family_id)
      } else {
        query = query.eq('user_id', session.user.id)
      }

      const { data, error } = await query.order('expense_date', {
        ascending: true,
      })

      if (error) {
        console.error(error)
        setErrorMessage('No se pudieron cargar los datos para las gráficas.')
        setLoading(false)
        return
      }

      setExpenses(data || [])
      setLoading(false)
    }

    loadAnalyticsData()
  }, [session.user.id, profile])

  const formatCurrency = (amount) => {
    return `S/ ${Number(amount).toFixed(2)}`
  }

  const getMonthLabel = (dateValue) => {
    if (!dateValue) return 'Sin fecha'

    const date = new Date(`${dateValue}T00:00:00`)

    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
    })
  }

  const groupByField = (fieldGetter) => {
    const grouped = {}

    expenses.forEach((expense) => {
      const key = fieldGetter(expense) || 'Sin dato'

      if (!grouped[key]) {
        grouped[key] = 0
      }

      grouped[key] += Number(expense.amount)
    })

    return Object.entries(grouped)
      .map(([name, total]) => ({
        name,
        total,
      }))
      .sort((a, b) => b.total - a.total)
  }

  const categoryData = useMemo(() => {
    return groupByField((expense) => expense.categories?.name || 'Sin categoría')
  }, [expenses])

  const monthData = useMemo(() => {
    const grouped = {}

    expenses.forEach((expense) => {
      const key = getMonthLabel(expense.expense_date)

      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          total: 0,
          sortValue: expense.expense_date || '',
        }
      }

      grouped[key].total += Number(expense.amount)
    })

    return Object.values(grouped).sort((a, b) =>
      a.sortValue.localeCompare(b.sortValue)
    )
  }, [expenses])

  const paymentMethodData = useMemo(() => {
    return groupByField((expense) => expense.payment_method || 'Sin método')
  }, [expenses])

  const userData = useMemo(() => {
    return groupByField((expense) => expense.profiles?.full_name || 'Sin usuario')
  }, [expenses])

  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  const maxValue = Math.max(
    ...categoryData.map((item) => item.total),
    ...monthData.map((item) => item.total),
    ...paymentMethodData.map((item) => item.total),
    ...userData.map((item) => item.total),
    1
  )

  const renderBarChart = (title, data, emptyMessage) => {
    return (
      <div className="analytics-card">
        <div className="analytics-card-header">
          <h2>{title}</h2>
          <span>{data.length} registros</span>
        </div>

        {data.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <div className="bar-chart-list">
            {data.map((item) => {
              const percentage = Math.max((item.total / maxValue) * 100, 4)

              return (
                <div className="bar-chart-item" key={item.name}>
                  <div className="bar-chart-label-row">
                    <span>{item.name}</span>
                    <strong>{formatCurrency(item.total)}</strong>
                  </div>

                  <div className="bar-chart-track">
                    <div
                      className="bar-chart-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardSection
        title="Gráficas"
        description="Visualiza el comportamiento de tus gastos mediante gráficos y comparaciones."
      >
        <p>Cargando gráficas...</p>
      </DashboardSection>
    )
  }

  if (errorMessage) {
    return (
      <DashboardSection
        title="Gráficas"
        description="Visualiza el comportamiento de tus gastos mediante gráficos y comparaciones."
      >
        <p className="error-message">{errorMessage}</p>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection
      title="Gráficas"
      description="Visualiza el comportamiento de tus gastos mediante gráficos y comparaciones."
    >
      <div className="analytics-summary-grid">
        <div className="analytics-summary-card">
          <span>Total analizado</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </div>

        <div className="analytics-summary-card">
          <span>Cantidad de gastos</span>
          <strong>{expenses.length}</strong>
        </div>

        <div className="analytics-summary-card">
          <span>Categorías usadas</span>
          <strong>{categoryData.length}</strong>
        </div>

        <div className="analytics-summary-card">
          <span>Métodos de pago</span>
          <strong>{paymentMethodData.length}</strong>
        </div>
      </div>

      <div className="analytics-grid">
        {renderBarChart(
          'Gasto por categoría',
          categoryData,
          'No hay gastos por categoría.'
        )}

        {renderBarChart(
          'Gasto por mes',
          monthData,
          'No hay gastos por mes.'
        )}

        {renderBarChart(
          'Gasto por método de pago',
          paymentMethodData,
          'No hay gastos por método de pago.'
        )}

        {renderBarChart(
          'Gasto por usuario',
          userData,
          'No hay gastos por usuario.'
        )}
      </div>
    </DashboardSection>
  )
}

AnalyticsSection.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  profile: PropTypes.shape({
    family_id: PropTypes.string,
    role: PropTypes.string.isRequired,
    system_role: PropTypes.string.isRequired,
  }).isRequired,
}

export default AnalyticsSection