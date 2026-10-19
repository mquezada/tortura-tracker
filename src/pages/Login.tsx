import { useState, type FormEvent } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
      if (error) setError(error.message)
      else {
        setNotice(`Si ${email} tiene cuenta, te llegará un correo con un enlace para elegir una contraseña nueva.`)
        setMode('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(
          error.code === 'email_not_confirmed'
            ? 'Todavía no confirmas tu correo. Revisa tu bandeja de entrada (y spam).'
            : error.code === 'invalid_credentials'
              ? 'Email o contraseña incorrectos.'
              : error.message,
        )
      }
    }
    setBusy(false)
  }

  function switchTo(next: typeof mode) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  return (
    <main className="page narrow">
      <h1 className="brand">Tortura Tracker</h1>
      <form className="card stack" onSubmit={submit}>
        {mode === 'reset' && <p className="muted small">Te enviaremos un enlace para elegir una contraseña nueva.</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        {mode !== 'reset' && (
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </label>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {mode === 'login' ? 'Entrar' : 'Enviar enlace'}
        </button>
        {mode === 'login' ? (
          <button type="button" className="link" onClick={() => switchTo('reset')}>
            ¿Olvidaste tu contraseña?
          </button>
        ) : (
          <button type="button" className="link" onClick={() => switchTo('login')}>
            Volver a entrar
          </button>
        )}
      </form>
    </main>
  )
}
