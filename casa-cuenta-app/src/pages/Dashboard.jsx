import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseTable from '../components/ExpenseTable'
import SummaryCards from '../components/SummaryCards'
import Filters from '../components/Filters'
import CreateFamily from '../components/CreateFamily'
import JoinFamily from '../components/JoinFamily'
import FamilyPanel from '../components/FamilyPanel'
import MyAccount from '../components/MyAccount'
function Dashboard({ session }) {
  const [refresh, setRefresh] = useState(0)
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showAccount, setShowAccount] = useState(false)

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
      .select('id, family_id, full_name, role, is_active, families (name)')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error(error)
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
    return <p>Cargando perfil...</p>
  }

  if (!profile) {
    return <p>No se pudo cargar el perfil.</p>
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard CasaCuenta</h1>
          <p>
            Bienvenido: <strong>{profile.full_name}</strong>
          </p>
          <p>
            Rol: <strong>{profile.role}</strong>
          </p>
          <p>
            Estado:{' '}
            <strong>
              {profile.family_id ? `Con familia - ${profile.families?.name}` : 'Sin familia'}
            </strong>
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="account-button"
            onClick={() => setShowAccount((prev) => !prev)}
          >
            Mi cuenta
          </button>

          <button onClick={handleLogout} className="logout-button">
            Cerrar sesión
          </button>
        </div>
      </header>

      {showAccount && (
        <MyAccount
          session={session}
          profile={profile}
          onClose={() => setShowAccount(false)}
          onProfileUpdated={loadProfile}
        />
      )}

      {!profile.family_id && (
        <div className="family-actions-grid">
          <CreateFamily
            profile={profile}
            onFamilyCreated={handleFamilyCreated}
          />

          <JoinFamily
            profile={profile}
            onFamilyJoined={handleFamilyCreated}
          />
        </div>
      )}

      {profile.family_id && profile.role === 'family_admin' && (
        <FamilyPanel profile={profile} />
      )}

      <SummaryCards session={session} refresh={refresh} />

      <main className="dashboard-content">
        <ExpenseForm
          session={session}
          onExpenseCreated={handleRefresh}
        />

        <section className="expenses-section">
          <Filters
            session={session}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          <ExpenseTable
            session={session}
            refresh={refresh}
            filters={filters}
            onExpenseChanged={handleRefresh}
          />
        </section>
      </main>
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