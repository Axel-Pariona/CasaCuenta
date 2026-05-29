import PropTypes from 'prop-types'

function LoadingScreen({ title = 'Cargando...', description }) {
  return (
    <div className="loading-screen">
      <div className="loading-card">
        <div className="loading-spinner" />

        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>
    </div>
  )
}

LoadingScreen.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
}

export default LoadingScreen