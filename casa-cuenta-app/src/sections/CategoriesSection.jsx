import PropTypes from 'prop-types'
import CategoryManager from '../components/CategoryManager'
import DashboardSection from '../components/layout/DashboardSection'

function CategoriesSection({ profile }) {
  const isAdmin = profile.system_role === 'admin'
  const isFamilyAdmin = profile.role === 'family_admin'

  if (!isAdmin && !isFamilyAdmin) {
    return (
      <DashboardSection
        title="Categorías"
        description="No tienes permisos para administrar categorías."
      >
        <div className="placeholder-card">
          <h2>Acceso restringido</h2>
          <p>
            Solo los administradores familiares y el administrador general
            pueden administrar categorías.
          </p>
        </div>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection
      title={isAdmin ? 'Categorías globales' : 'Categorías familiares'}
      description={
        isAdmin
          ? 'Administra las categorías globales usadas por usuarios sin familia.'
          : 'Administra las categorías disponibles para los miembros de tu familia.'
      }
    >
      <CategoryManager profile={profile} />
    </DashboardSection>
  )
}

CategoriesSection.propTypes = {
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
    family_id: PropTypes.string,
  }).isRequired,
}

export default CategoriesSection