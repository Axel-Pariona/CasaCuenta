import { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import DashboardSection from '../components/layout/DashboardSection'

function ExportsSection({ session, profile }) {
  const [loadingType, setLoadingType] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const formatDateForFile = () => {
    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value).replace(/"/g, '""')

    return `"${stringValue}"`
  }

  const buildCsv = (rows) => {
    const headers = [
      'Fecha',
      'Usuario',
      'Correo',
      'Familia',
      'Categoría',
      'Método de pago',
      'Descripción',
      'Monto',
    ]

    const csvRows = rows.map((expense) => [
      expense.expense_date || '',
      expense.profiles?.full_name || 'Sin nombre',
      expense.profiles?.email || '',
      expense.families?.name || 'Sin familia',
      expense.categories?.name || 'Sin categoría',
      expense.payment_method || '',
      expense.description || '',
      Number(expense.amount).toFixed(2),
    ])

    return [
      headers.map(escapeCsvValue).join(','),
      ...csvRows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n')
  }

  const downloadCsv = (csvContent, fileName) => {
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = fileName
    link.click()

    URL.revokeObjectURL(url)
  }

  const getBaseQuery = () => {
    return supabase
      .from('expenses')
      .select(`
        id,
        user_id,
        family_id,
        expense_date,
        amount,
        description,
        payment_method,
        categories (
          name
        ),
        profiles (
          full_name,
          email
        ),
        families (
          name
        )
      `)
      .order('expense_date', { ascending: false })
  }

  const handleExport = async (type) => {
    setLoadingType(type)
    setErrorMessage('')
    setSuccessMessage('')

    let query = getBaseQuery()
    let fileName = ''

    if (type === 'personal') {
      query = query.eq('user_id', session.user.id)
      fileName = `mis-gastos-${formatDateForFile()}.csv`
    }

    if (type === 'family') {
      if (profile.role !== 'family_admin' || !profile.family_id) {
        setErrorMessage('No tienes permisos para exportar gastos familiares.')
        setLoadingType('')
        return
      }

      query = query.eq('family_id', profile.family_id)
      fileName = `gastos-familiares-${formatDateForFile()}.csv`
    }

    if (type === 'global') {
      if (profile.system_role !== 'admin') {
        setErrorMessage('No tienes permisos para exportar gastos globales.')
        setLoadingType('')
        return
      }

      fileName = `gastos-globales-${formatDateForFile()}.csv`
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      setErrorMessage('No se pudieron obtener los datos para exportar.')
      setLoadingType('')
      return
    }

    if (!data || data.length === 0) {
      setErrorMessage('No hay gastos disponibles para exportar.')
      setLoadingType('')
      return
    }

    const csvContent = buildCsv(data)

    downloadCsv(csvContent, fileName)

    setSuccessMessage('Archivo CSV generado correctamente.')
    setLoadingType('')
  }

  return (
    <DashboardSection
      title="Exportaciones"
      description="Descarga tus gastos en formato CSV para revisarlos en Excel, Google Sheets u otra herramienta."
    >
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="exports-grid">
        <div className="export-card">
          <h2>Mis gastos</h2>
          <p>
            Exporta únicamente los gastos registrados por tu cuenta.
          </p>

          <button
            type="button"
            onClick={() => handleExport('personal')}
            disabled={loadingType !== ''}
          >
            {loadingType === 'personal'
              ? 'Generando...'
              : 'Descargar CSV'}
          </button>
        </div>

        {profile.role === 'family_admin' && (
          <div className="export-card">
            <h2>Gastos familiares</h2>
            <p>
              Exporta los gastos registrados por todos los miembros de tu
              familia. Esta opción es solo para administradores familiares.
            </p>

            <button
              type="button"
              onClick={() => handleExport('family')}
              disabled={loadingType !== ''}
            >
              {loadingType === 'family'
                ? 'Generando...'
                : 'Descargar CSV'}
            </button>
          </div>
        )}

        {profile.system_role === 'admin' && (
          <div className="export-card">
            <h2>Gastos globales</h2>
            <p>
              Exporta todos los gastos registrados en el sistema. Esta opción
              es solo para administradores generales.
            </p>

            <button
              type="button"
              onClick={() => handleExport('global')}
              disabled={loadingType !== ''}
            >
              {loadingType === 'global'
                ? 'Generando...'
                : 'Descargar CSV'}
            </button>
          </div>
        )}
      </div>
    </DashboardSection>
  )
}

ExportsSection.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  profile: PropTypes.shape({
    family_id: PropTypes.string,
    role: PropTypes.string.isRequired,
    system_role: PropTypes.string.isRequired,
  }).isRequired,
}

export default ExportsSection