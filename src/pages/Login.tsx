import { useState, type FormEvent } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [name, setName] = useState('')
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
    } else if (mode === 'login') {
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
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name }, emailRedirectTo: window.location.origin },
      })
      if (error) setError(error.message)
      else if (!data.session) {
        // Supabase pide confirmar el correo antes de entrar
        setNotice(`Te enviamos un correo a ${email}. Ábrelo y confirma tu cuenta para poder entrar.`)
        setMode('login')
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
        {mode !== 'reset' && (
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
          {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : 'Enviar enlace'}
        </button>
        {mode === 'login' ? (
          <>
            <button type="button" className="link" onClick={() => switchTo('reset')}>
              ¿Olvidaste tu contraseña?
            </button>
            <button type="button" className="link" onClick={() => switchTo('signup')}>
              ¿No tienes cuenta? Regístrate
            </button>
          </>
        ) : (
          <button type="button" className="link" onClick={() => switchTo('login')}>
            Volver a entrar
          </button>
        )}
      </form>
    </main>
  )
}
