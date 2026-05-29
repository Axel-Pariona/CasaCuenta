import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import PropTypes from 'prop-types'

import AppNavigation from '../components/layout/AppNavigation'
import DashboardHeader from '../components/layout/DashboardHeader'

import LoadingScreen from '../components/layout/LoadingScreen'

import ExpensesSection from '../sections/ExpensesSection'
import FamilyExpensesSection from '../sections/FamilyExpensesSection'
import GlobalExpensesSection from '../sections/GlobalExpensesSection'
import FamilySection from '../sections/FamilySection'
import CategoriesSection from '../sections/CategoriesSection'
import AccountSection from '../sections/AccountSection'
import OverviewSection from '../sections/OverviewSection'
import AnalyticsSection from '../sections/AnalyticsSection'
import ExportsSection from '../sections/ExportsSection'
import AdminSection from '../sections/AdminSection'


function Dashboard({ session }) {
  const [refresh, setRefresh] = useState(0)
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [activeSection, setActiveSection] = useState('overview')

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    paymentMethod: '',
    search: '',
  })

  const loadProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, family_id, full_name, role, system_role, is_active, families (name)')
      .eq('id', session.user.id)
      .single()

    if (error) {
      setLoadingProfile(false)
      return
    }

    if (!data.is_active) {
      await supabase.auth.signOut()
      setLoadingProfile(false)
      return
    }

    setProfile(data)
    setLoadingProfile(false)
  }, [session.user.id])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleFamilyCreated = async () => {
    setLoadingProfile(true)
    await loadProfile()
    handleRefresh()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleRefresh = () => {
    setRefresh((prev) => prev + 1)
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      paymentMethod: '',
      search: '',
    })
  }

  if (loadingProfile) {
    return (
      <LoadingScreen
        title="Cargando usuario"
        description="Estamos obteniendo la información de tu cuenta."
      />
    )
  }

  if (!profile) {
    return (
      <LoadingScreen
        title="No se pudo cargar el perfil"
        description="Intenta cerrar sesión y volver a ingresar."
      />
    )
  }

  return (
    <div className="dashboard-layout">
      <AppNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        profile={profile}
      />

      <div className="dashboard-main">
        <DashboardHeader
          profile={profile}
          onLogout={handleLogout}
        />

        {activeSection === 'overview' && (
          <OverviewSection
            session={session}
            refresh={refresh}
            profile={profile}
          />
        )}

        
        {activeSection === 'expenses' && (
          <ExpensesSection
            session={session}
            refresh={refresh}
            filters={filters}
            onExpenseCreated={handleRefresh}
            onExpenseChanged={handleRefresh}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        )}
        
        {activeSection === 'family-expenses' && (
          <FamilyExpensesSection profile={profile} />
        )}

        {activeSection === 'global-expenses' && (
          <GlobalExpensesSection profile={profile} />
        )}

        {activeSection === 'family' && (
          <FamilySection
            profile={profile}
            onFamilyCreated={handleFamilyCreated}
          />
        )}

        {activeSection === 'categories' && (
          <CategoriesSection profile={profile} />
        )}

        {activeSection === 'account' && (
          <AccountSection
            session={session}
            profile={profile}
            onProfileUpdated={loadProfile}
            onBack={() => setActiveSection('overview')}
          />
        )}

        {activeSection === 'analytics' && (
          <AnalyticsSection
            session={session}
            profile={profile}
          />
        )}

        {activeSection === 'exports' && (
          <ExportsSection
            session={session}
            profile={profile}
          />
        )}

        {activeSection === 'admin' && (
          <AdminSection profile={profile} />
        )}
      </div>
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