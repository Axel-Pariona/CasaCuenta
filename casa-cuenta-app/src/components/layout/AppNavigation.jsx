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
  ]

<<<<<<< HEAD
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
=======
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
>>>>>>> fb3ff5bdd1794c39d5c889e838797275bce57a31
  }

  menuItems.push({
    id: 'family',
    label: 'Familia',
  })

  if (isFamilyAdmin || isGlobalAdmin) {
    menuItems.push(
      { id: 'categories', label: 'Categorías' },
      { id: 'analytics', label: 'Gráficas' },
      { id: 'exports', label: 'Exportaciones' }
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