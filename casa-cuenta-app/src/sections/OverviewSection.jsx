import PropTypes from 'prop-types'
import SummaryCards from '../components/SummaryCards'
import DashboardSection from '../components/layout/DashboardSection'

function OverviewSection({ session, refresh, profile }) {
  return (
    <DashboardSection
      title={profile.system_role === 'admin' ? 'Resumen global' : 'Resumen'}
      description={
        profile.system_role === 'admin'
          ? 'Vista general de los gastos registrados en el sistema.'
          : 'Vista general de tus gastos y movimientos recientes.'
      }
    >
      <SummaryCards
        session={session}
        refresh={refresh}
        profile={profile}
      />
    </DashboardSection>
  )
}

OverviewSection.propTypes = {
  session: PropTypes.object.isRequired,
  refresh: PropTypes.number.isRequired,
  profile: PropTypes.shape({
    family_id: PropTypes.string,
    role: PropTypes.string.isRequired,
    system_role: PropTypes.string.isRequired,
  }).isRequired,
}

export default OverviewSection