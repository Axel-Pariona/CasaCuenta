import DashboardSection from '../components/layout/DashboardSection'

function AnalyticsSection() {
  return (
    <DashboardSection
      title="Gráficas"
      description="Visualiza el comportamiento de tus gastos mediante gráficos y comparaciones."
    >
      <div className="placeholder-card">
        <h2>Gráficas próximamente</h2>
        <p>
          Más adelante agregaremos gráficos por categoría, usuario, mes,
          método de pago y comparaciones entre periodos.
        </p>
      </div>
    </DashboardSection>
  )
}

export default AnalyticsSection