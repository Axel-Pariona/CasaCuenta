import PropTypes from 'prop-types'

function DashboardHeader({ profile, onLogout }) {
  return (
    <header className="dashboard-header">
      <div>
        <h1>Dashboard CasaCuenta</h1>
        <p>
          Bienvenido: <strong>{profile.full_name}</strong>
        </p>
      </div>

      <button onClick={onLogout} className="logout-button">
        Cerrar sesión
      </button>
    </header>
  )
}

DashboardHeader.propTypes = {
  profile: PropTypes.shape({
    full_name: PropTypes.string.isRequired,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
}

export default DashboardHeader