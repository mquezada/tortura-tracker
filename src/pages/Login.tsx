import { useState, type FormEvent } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <main className="page narrow">
      <h1 className="brand">Tortura Tracker</h1>
      <form className="card stack" onSubmit={submit}>
        {mode === 'signup' && (
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>
          {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : 'Ya tengo cuenta'}
        </button>
      </form>
    </main>
  )
}
