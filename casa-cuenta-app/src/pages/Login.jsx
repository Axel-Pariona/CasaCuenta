import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    onLogin(data.session)
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CasaCuenta</h1>
        <p>Control de gastos familiares</p>

        <form onSubmit={handleLogin}>
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

          {errorMessage && <span className="error">{errorMessage}</span>}

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login