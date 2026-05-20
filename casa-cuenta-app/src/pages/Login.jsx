import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import './Login.css'

function Login({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_active')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error(profileError)
      setErrorMessage('No se pudo validar el estado de la cuenta.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (!profileData.is_active) {
      sessionStorage.setItem(
        'login_message',
        'Cuenta desactivada. Comuníquese con el administrador.'
      )

      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    onLogin(data.session)
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      onLogin(data.session)
    } else {
      setSuccessMessage(
        'Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.'
      )
    }

    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  const toggleMode = () => {
    setIsRegisterMode((prev) => !prev)
    setErrorMessage('')
    setSuccessMessage('')
    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  useEffect(() => {
    const blockedMessage = sessionStorage.getItem('login_message')

    if (blockedMessage) {
      setErrorMessage(blockedMessage)
      sessionStorage.removeItem('login_message')
    }
  }, [])

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CasaCuenta</h1>
        <p>
          {isRegisterMode
            ? 'Crea tu cuenta para registrar tus gastos'
            : 'Control de gastos familiares'}
        </p>

        <form onSubmit={isRegisterMode ? handleRegister : handleLogin}>
          {isRegisterMode && (
            <>
              <label>Nombre completo</label>
              <input
                type="text"
                placeholder="Ejemplo: Axel Pariona"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </>
          )}

          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="ejemplo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isRegisterMode && (
            <>
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}

          {errorMessage && <span className="error">{errorMessage}</span>}
          {successMessage && <span className="success">{successMessage}</span>}

          <button type="submit" disabled={loading}>
            {loading
              ? isRegisterMode
                ? 'Creando cuenta...'
                : 'Ingresando...'
              : isRegisterMode
                ? 'Crear cuenta'
                : 'Iniciar sesión'}
          </button>
        </form>

        <button
          type="button"
          className="switch-mode-button"
          onClick={toggleMode}
        >
          {isRegisterMode
            ? 'Ya tengo cuenta, iniciar sesión'
            : 'No tengo cuenta, crear una'}
        </button>
      </div>
    </div>
  )
}

export default Login