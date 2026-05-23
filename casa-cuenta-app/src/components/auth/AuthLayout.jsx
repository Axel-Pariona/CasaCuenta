import PropTypes from 'prop-types'
import '../../styles/auth.css'

function AuthLayout({ title, description, children }) {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{title}</h1>
        <p>{description}</p>

        {children}
      </div>
    </div>
  )
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default AuthLayout