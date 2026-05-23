import PropTypes from 'prop-types'

function AppNavigation({ activeSection, onSectionChange, profile }) {
  const baseItems = [
    { id: 'overview', label: 'Resumen' },
    { id: 'expenses', label: 'Gastos' },
    { id: 'family', label: 'Familia' },
    { id: 'account', label: 'Mi cuenta' },
  ]

  const familyAdminItems = [
    { id: 'categories', label: 'Categorías' },
    { id: 'analytics', label: 'Gráficas' },
    { id: 'exports', label: 'Exportaciones' },
  ]

  const adminItems = [
    { id: 'categories', label: 'Categorías' },
    { id: 'analytics', label: 'Gráficas' },
    { id: 'exports', label: 'Exportaciones' },
    { id: 'admin', label: 'Admin' },
  ]

  const isGlobalAdmin = profile.system_role === 'admin'
  const isFamilyAdmin = profile.role === 'family_admin'

  let menuItems = [...baseItems]

  if (isFamilyAdmin) {
    menuItems = [...baseItems, ...familyAdminItems]
  }

  if (isGlobalAdmin) {
    menuItems = [
      { id: 'overview', label: 'Resumen global' },
      { id: 'expenses', label: 'Gastos globales' },
      { id: 'family', label: 'Familia' },
      { id: 'categories', label: 'Categorías' },
      { id: 'analytics', label: 'Gráficas' },
      { id: 'exports', label: 'Exportaciones' },
      { id: 'admin', label: 'Admin' },
      { id: 'account', label: 'Mi cuenta' },
    ]
  }

  return (
    <nav className="app-navigation">
      <div className="nav-brand">
        <strong>CasaCuenta</strong>
        <span>{profile.role}</span>
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