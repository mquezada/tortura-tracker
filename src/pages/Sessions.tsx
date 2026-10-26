import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase, type RoutineDay, type Session } from '../supabase'
import { formatDate, todayISO } from '../dates'
import { useCachedState } from '../cache'
import { copyExercises, exerciseNames, fetchSessions, suggestedSource } from '../sessionsData'

export default function Sessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useCachedState<Session[]>('sessions', [])
  const [days, setDays] = useCachedState<RoutineDay[]>('routine_days', [])
  const [date, setDate] = useState(todayISO())
  const [dayId, setDayId] = useState('')
  // null = usar la sugerida; '' = no copiar
  const [copyFrom, setCopyFrom] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch((e) => setError(e.message))
    supabase
      .from('routine_days')
      .select('*')
      .order('position')
      .then(({ data }) => setDays((data as RoutineDay[]) ?? []))
  }, [setSessions, setDays])

  const suggested = suggestedSource(sessions, date)
  const sourceId = copyFrom ?? suggested?.id ?? ''
  const copyOptions = sessions.filter((s) => s.session_exercises?.length).slice(0, 15)

  async function createSession(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { data, error } = await supabase
      .from('sessions')
      .insert({ date, routine_day_id: dayId || null })
      .select('id')
      .single()
    if (error) {
      setBusy(false)
      return setError(error.message)
    }

    if (sourceId) {
      await copyExercises(sourceId, data.id).catch((e) => setError(e.message))
    } else if (dayId) {
      const { data: routine } = await supabase
        .from('routine_exercises')
        .select('exercise_id, position')
        .eq('routine_day_id', dayId)
      if (routine?.length) {
        await supabase
          .from('session_exercises')
          .insert(routine.map((r) => ({ session_id: data.id, exercise_id: r.exercise_id, position: r.position })))
      }
    }
    setBusy(false)
    navigate(`/sesion/${data.id}`)
  }

  return (
    <main className="page">
      <header className="topbar">
        <h1 className="brand">Tortura Tracker</h1>
        <button className="link" onClick={() => supabase.auth.signOut()}>
          Salir
        </button>
      </header>

      <form className="card stack" onSubmit={createSession}>
        <h2>Nueva sesión</h2>
        <div className="row">
          <label className="grow">
            Fecha
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          {days.length > 0 && (
            <label className="grow">
              Día de rutina
              <select value={dayId} onChange={(e) => setDayId(e.target.value)}>
                <option value="">— Libre —</option>
                {days.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {copyOptions.length > 0 && (
          <label>
            Copiar ejercicios de
            <select value={sourceId} onChange={(e) => setCopyFrom(e.target.value)}>
              <option value="">— No copiar —</option>
              {copyOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatDate(s.date)} · {exerciseNames(s).length} ejercicios
                </option>
              ))}
            </select>
            {sourceId && (
              <span className="small">{exerciseNames(sessions.find((s) => s.id === sourceId)!).join(' · ')}</span>
            )}
          </label>
        )}
        <button className="primary" disabled={busy}>
          Empezar
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <h2>Sesiones</h2>
      {sessions.length === 0 && <p className="muted">Todavía no hay sesiones.</p>}
      <ul className="list">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link to={`/sesion/${s.id}`} className="card link-card">
              <strong className="capitalize">{formatDate(s.date)}</strong>
              {s.routine_days && <span className="muted">{s.routine_days.name}</span>}
              {exerciseNames(s).length > 0 && <span className="muted small">{exerciseNames(s).join(' · ')}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
