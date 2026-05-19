import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function Dashboard({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboard CasaCuenta</h1>

      <p>
        Bienvenido: <strong>{session?.user?.email}</strong>
      </p>

      <button onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  )
}

Dashboard.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      email: PropTypes.string,
    }),
  }).isRequired,
}

export default Dashboard