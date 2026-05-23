import DashboardSection from '../components/layout/DashboardSection'

function ExportsSection() {
  return (
    <DashboardSection
      title="Exportaciones"
      description="Exporta tus gastos para analizarlos fuera de CasaCuenta."
    >
      <div className="placeholder-card">
        <h2>Exportaciones próximamente</h2>
        <p>
          Más adelante podrás exportar tus gastos a Excel o CSV, aplicando
          filtros por fecha, categoría, usuario o método de pago.
        </p>
      </div>
    </DashboardSection>
  )
}

export default ExportsSection