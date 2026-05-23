import PropTypes from 'prop-types'
import DashboardSection from '../components/layout/DashboardSection'

function AdminSection({ profile }) {
  if (profile.role !== 'admin') {
    return (
      <DashboardSection
        title="Administración"
        description="No tienes permisos para acceder a esta sección."
      >
        <div className="placeholder-card">
          <h2>Acceso restringido</h2>
          <p>
            Solo el administrador general puede acceder al panel de
            administración global.
          </p>
        </div>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection
      title="Panel de administración"
      description="Monitorea usuarios, familias, cuentas y actividad general del sistema."
    >
      <div className="placeholder-card">
        <h2>Administración próximamente</h2>
        <p>
          Más adelante agregaremos monitoreo global de usuarios, familias,
          cuentas activas/inactivas y estadísticas generales.
        </p>
      </div>
    </DashboardSection>
  )
}

AdminSection.propTypes = {
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
  }).isRequired,
}

export default AdminSection