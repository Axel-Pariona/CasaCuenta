import PropTypes from 'prop-types'
import SummaryCards from '../components/SummaryCards'
import DashboardSection from '../components/layout/DashboardSection'

function OverviewSection({ session, refresh, profile }) {
  return (
    <DashboardSection
      title={profile.role === 'admin' ? 'Resumen global' : 'Resumen'}
      description={
        profile.role === 'admin'
          ? 'Vista general de los gastos registrados en el sistema.'
          : 'Vista general de tus gastos y movimientos recientes.'
      }
    >
      <SummaryCards session={session} refresh={refresh} />

      <div className="placeholder-card">
        <h2>Próximamente</h2>
        <p>
          Aquí agregaremos gráficos rápidos, comparaciones mensuales y alertas
          de gastos importantes.
        </p>
      </div>
    </DashboardSection>
  )
}

OverviewSection.propTypes = {
  session: PropTypes.object.isRequired,
  refresh: PropTypes.number.isRequired,
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
  }).isRequired,
}

export default OverviewSection