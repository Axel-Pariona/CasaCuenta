import PropTypes from 'prop-types'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseTable from '../components/ExpenseTable'
import Filters from '../components/Filters'
import DashboardSection from '../components/layout/DashboardSection'

function ExpensesSection({
  session,
  refresh,
  filters,
  onExpenseCreated,
  onExpenseChanged,
  onFilterChange,
  onClearFilters,
}) {
  return (
    <DashboardSection
      title="Gastos"
      description="Registra, filtra, edita y revisa los gastos registrados."
    >
      <main className="dashboard-content">
        <ExpenseForm
          session={session}
          onExpenseCreated={onExpenseCreated}
        />

        <section className="expenses-section">
          <Filters
            session={session}
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />

          <ExpenseTable
            session={session}
            refresh={refresh}
            filters={filters}
            onExpenseChanged={onExpenseChanged}
          />
        </section>
      </main>
    </DashboardSection>
  )
}

ExpensesSection.propTypes = {
  session: PropTypes.object.isRequired,
  refresh: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  onExpenseCreated: PropTypes.func.isRequired,
  onExpenseChanged: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
}

export default ExpensesSection