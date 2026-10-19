import { useState, type FormEvent } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../auth'

export default function NewPassword() {
  const { finishRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) return setError('Las contraseñas no coinciden.')
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) setError(error.message)
    else finishRecovery()
  }

  return (
    <main className="page narrow">
      <h1 className="brand">Tortura Tracker</h1>
      <form className="card stack" onSubmit={submit}>
        <h2>Elige tu contraseña</h2>
        <label>
          Contraseña nueva
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <label>
          Repetir contraseña
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          Guardar contraseña
        </button>
      </form>
    </main>
  )
}
