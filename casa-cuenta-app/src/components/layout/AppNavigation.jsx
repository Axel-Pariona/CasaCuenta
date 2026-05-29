import PropTypes from 'prop-types'

function AppNavigation({ activeSection, onSectionChange, profile }) {
  const isGlobalAdmin = profile.system_role === 'admin'
  const isFamilyAdmin = profile.role === 'family_admin'

  const menuItems = [
    {
      id: 'overview',
      label: isGlobalAdmin ? 'Resumen global' : 'Resumen',
    },
    {
      id: 'expenses',
      label: 'Mis gastos',
    },
    {
      id: 'family',
      label: 'Familia',
    },
    {
      id: 'exports', 
      label: 'Exportaciones',
    },
  ]

  if (isGlobalAdmin) {
    menuItems.push({
      id: 'global-expenses',
      label: 'Gastos globales',
    })
  }

  if (isFamilyAdmin) {
    menuItems.push({
      id: 'family-expenses',
      label: 'Gastos familiares',
    })
  }

  if (isFamilyAdmin || isGlobalAdmin) {
    menuItems.push(
      { id: 'categories', label: 'Categorías' },
      { id: 'analytics', label: 'Gráficas' }
    )
  }

  if (isGlobalAdmin) {
    menuItems.push({
      id: 'admin',
      label: 'Admin',
    })
  }

  menuItems.push({
    id: 'account',
    label: 'Mi cuenta',
  })

  return (
    <nav className="app-navigation">
      <div className="nav-brand">
        <strong>CasaCuenta</strong>
        <span>
          {isGlobalAdmin
            ? 'admin global'
            : isFamilyAdmin
              ? 'admin familiar'
              : profile.role}
        </span>
      </div>

      <div className="nav-items">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              activeSection === item.id
                ? 'nav-item nav-item-active'
                : 'nav-item'
            }
            onClick={() => onSectionChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

AppNavigation.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
    system_role: PropTypes.string.isRequired,
  }).isRequired,
}

export default AppNavigation