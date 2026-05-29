import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../services/supabaseClient'

function CategoryManager({ profile }) {
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const canManageCategories =
    profile.system_role === 'admin' || profile.role === 'family_admin'

  const loadCategories = async () => {
    setErrorMessage('')

    let query = supabase
      .from('categories')
      .select(`
        id,
        name,
        family_id,
        is_active,
        families (
          name
        )
      `)
      .order('is_active', { ascending: false })
      .order('name', { ascending: true })

    if (profile.system_role === 'admin') {
      query = query.is('family_id', null)
    } else if (profile.role === 'family_admin') {
      query = query.eq('family_id', profile.family_id)
    } else {
      return
    }

    const { data, error } = await query

    if (error) {
      setErrorMessage('No se pudieron cargar las categorías.')
      return
    }

    setCategories(data)
  }

  useEffect(() => {
    if (canManageCategories) {
      loadCategories()
    }
  }, [profile.role, profile.family_id])

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.rpc('create_category', {
        category_name_input: newCategoryName,
    })

    if (error) {
        setErrorMessage(error.message || 'No se pudo crear la categoría.')
        setLoading(false)
        return
    }

    setSuccessMessage('Categoría creada correctamente.')
    setNewCategoryName('')
    await loadCategories()
    setLoading(false)
    }

    const handleStartEdit = (category) => {
    setEditingCategoryId(category.id)
    setEditingName(category.name)
    setErrorMessage('')
    setSuccessMessage('')
    }

    const handleCancelEdit = () => {
    setEditingCategoryId(null)
    setEditingName('')
    }

  const handleUpdateCategory = async (categoryId) => {
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.rpc('update_category_name', {
        category_id_input: categoryId,
        category_name_input: editingName,
    })

    if (error) {
        setErrorMessage(error.message || 'No se pudo actualizar la categoría.')
        setLoading(false)
        return
    }

    setSuccessMessage('Categoría actualizada correctamente.')
    setEditingCategoryId(null)
    setEditingName('')
    await loadCategories()
    setLoading(false)
    }

  const handleToggleActive = async (category) => {
    const action = category.is_active ? 'desactivar' : 'reactivar'

    const confirmed = window.confirm(
        `¿Seguro que deseas ${action} la categoría "${category.name}"?`
    )

    if (!confirmed) {
        return
    }

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase.rpc('set_category_active', {
        category_id_input: category.id,
        active_input: !category.is_active,
    })

    if (error) {
        setErrorMessage(error.message || 'No se pudo modificar la categoría.')
        setLoading(false)
        return
    }

    setSuccessMessage(
        category.is_active
        ? 'Categoría desactivada correctamente.'
        : 'Categoría reactivada correctamente.'
    )

    await loadCategories()
    setLoading(false)
    }

  if (!canManageCategories) {
    return null
  }

  return (
    <div className="category-manager-card">
      <form onSubmit={handleCreateCategory} className="category-form">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear categoría'}
        </button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="category-list">
        {categories.length === 0 ? (
          <p>No hay categorías registradas.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className={`category-item ${
                !category.is_active ? 'category-item-disabled' : ''
              }`}
            >
              {editingCategoryId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />

                  <button
                    type="button"
                    className="save-button"
                    onClick={() => handleUpdateCategory(category.id)}
                    disabled={loading}
                  >
                    Guardar
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <strong>{category.name}</strong>
                    <span>
                      {category.is_active ? 'Activa' : 'Desactivada'}
                    </span>
                  </div>

                  <div className="category-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleStartEdit(category)}
                      disabled={loading}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className={
                        category.is_active ? 'delete-button' : 'save-button'
                      }
                      onClick={() => handleToggleActive(category)}
                      disabled={loading}
                    >
                      {category.is_active ? 'Desactivar' : 'Reactivar'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

CategoryManager.propTypes = {
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
    family_id: PropTypes.string,
  }).isRequired,
}

export default CategoryManager