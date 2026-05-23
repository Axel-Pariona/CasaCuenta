import PropTypes from 'prop-types'

function DashboardSection({ title, description, children }) {
  return (
    <section className="dashboard-section">
      {(title || description) && (
        <div className="dashboard-section-header">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      )}

      {children}
    </section>
  )
}

DashboardSection.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default DashboardSection