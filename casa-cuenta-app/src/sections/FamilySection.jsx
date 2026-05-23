import PropTypes from 'prop-types'
import CreateFamily from '../components/CreateFamily'
import JoinFamily from '../components/JoinFamily'
import FamilyPanel from '../components/FamilyPanel'
import DashboardSection from '../components/layout/DashboardSection'

function FamilySection({ profile, onFamilyCreated }) {
  return (
    <DashboardSection
      title="Familia"
      description="Administra tu familia, el código de invitación o únete a una familia existente."
    >
      {!profile.family_id && (
        <div className="family-actions-grid">
          <CreateFamily
            profile={profile}
            onFamilyCreated={onFamilyCreated}
          />

          <JoinFamily
            profile={profile}
            onFamilyJoined={onFamilyCreated}
          />
        </div>
      )}

      {profile.family_id && (
        <FamilyPanel
          profile={profile}
          onFamilyUpdated={onFamilyCreated}
        />
      )}
    </DashboardSection>
  )
}

FamilySection.propTypes = {
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
    family_id: PropTypes.string,
    families: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  onFamilyCreated: PropTypes.func.isRequired,
}

export default FamilySection