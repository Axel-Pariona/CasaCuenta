import PropTypes from 'prop-types'
import MyAccount from '../components/MyAccount'
import DashboardSection from '../components/layout/DashboardSection'

function AccountSection({ session, profile, onProfileUpdated }) {
  return (
    <DashboardSection
      title="Mi cuenta"
      description="Administra tu información personal, seguridad y estado familiar."
    >
      <MyAccount
        session={session}
        profile={profile}
        onProfileUpdated={onProfileUpdated}
      />
    </DashboardSection>
  )
}

AccountSection.propTypes = {
  session: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  onProfileUpdated: PropTypes.func.isRequired,
}

export default AccountSection