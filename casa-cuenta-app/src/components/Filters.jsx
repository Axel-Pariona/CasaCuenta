import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'
import { logError } from '../utils/logger'

function Filters({ session, filters, onFilterChange, onClearFilters }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const loadCategories = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        logError(profileError)
        return
      }

      let categoriesQuery = supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (profileData.family_id) {
        categoriesQuery = categoriesQuery.eq('family_id', profileData.family_id)
      } else {
        categoriesQuery = categoriesQuery.is('family_id', null)
      }

      const { data: categoriesData, error: categoriesError } = await categoriesQuery

      if (categoriesError) {
        logError(categoriesError)
        return
      }

      setCategories(categoriesData)
    }

    loadCategories()
  }, [session.user.id])

  return (
    <div className="filters-card">
      <h2>Filtros</h2>

      <div className="filters-grid">
        <div>
          <label>Desde</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
          />
        </div>

        <div>
          <label>Hasta</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
          />
        </div>

        <div>
          <label>Categoría</label>
          <select
            value={filters.categoryId}
            onChange={(e) => onFilterChange('categoryId', e.target.value)}
          >
            <option value="">Todas</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Método de pago</label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => onFilterChange('paymentMethod', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label>Buscar descripción</label>
          <input
            type="text"
            placeholder="Ejemplo: almuerzo, pasaje..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-button-container">
          <button type="button" onClick={onClearFilters}>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  )
}

Filters.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  filters: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    categoryId: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
}

export default Filters