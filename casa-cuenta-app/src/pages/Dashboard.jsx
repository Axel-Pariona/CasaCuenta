import { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseTable from '../components/ExpenseTable'
import SummaryCards from '../components/SummaryCards'
import Filters from '../components/Filters'

function Dashboard({ session }) {
  const [refresh, setRefresh] = useState(0)

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    paymentMethod: '',
    search: '',
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleExpenseCreated = () => {
    setRefresh((prev) => prev + 1)
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      paymentMethod: '',
      search: '',
    })
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard CasaCuenta</h1>
          <p>
            Bienvenido: <strong>{session.user.email}</strong>
          </p>
        </div>

        <button onClick={handleLogout} className="logout-button">
          Cerrar sesión
        </button>
      </header>

      <SummaryCards session={session} refresh={refresh} />

      <main className="dashboard-content">
        <ExpenseForm
          session={session}
          onExpenseCreated={handleExpenseCreated}
        />

        <section className="expenses-section">
          <Filters
            session={session}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          <ExpenseTable
            session={session}
            refresh={refresh}
            filters={filters}
          />
        </section>
      </main>
    </div>
  )
}

Dashboard.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string,
    }).isRequired,
  }).isRequired,
}

export default Dashboard