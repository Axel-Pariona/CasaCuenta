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

      {profile.family_id && profile.role === 'family_admin' && (
        <FamilyPanel profile={profile} />
      )}

      {profile.family_id && profile.role !== 'family_admin' && (
        <div className="create-family-card">
          <h2>Mi familia</h2>

          <p>
            Perteneces a:{' '}
            <strong>{profile.families?.name || 'Sin nombre'}</strong>
          </p>

          <p>
            Tu rol dentro de esta familia es:{' '}
            <strong>{profile.role}</strong>
          </p>
        </div>
      )}

      {profile.role === 'admin' && (
        <div className="create-family-card">
          <h2>Vista de familias</h2>
          <p>
            Próximamente podrás monitorear familias registradas desde el panel
            de administración global.
          </p>
        </div>
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