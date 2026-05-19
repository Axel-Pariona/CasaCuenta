import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import ExpenseForm from '../components/ExpenseForm'

function Dashboard({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleExpenseCreated = () => {
    console.log('Gasto creado correctamente')
  }

  return (
    <div style={{ padding: '24px', background: '#f4f6f8', minHeight: '100vh' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1>Dashboard CasaCuenta</h1>

        <p>
          Bienvenido: <strong>{session.user.email}</strong>
        </p>

        <button onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <ExpenseForm
        session={session}
        onExpenseCreated={handleExpenseCreated}
      />
    </div>
  )
}

Dashboard.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string,
    }).isRequired,
  }).isRequired,
}

export default Dashboard