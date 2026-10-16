import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase, type RoutineDay, type Session } from '../supabase'
import { formatDate, todayISO } from '../dates'

export default function Sessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [days, setDays] = useState<RoutineDay[]>([])
  const [date, setDate] = useState(todayISO())
  const [dayId, setDayId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('sessions')
      .select('id, date, routine_day_id, notes, routine_days(name)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setSessions(data as unknown as Session[])
      })
    supabase
      .from('routine_days')
      .select('*')
      .order('position')
      .then(({ data }) => setDays((data as RoutineDay[]) ?? []))
  }, [])

  async function createSession(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const { data, error } = await supabase
      .from('sessions')
      .insert({ date, routine_day_id: dayId || null })
      .select('id')
      .single()
    if (error) return setError(error.message)

    if (dayId) {
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
        <button className="primary">Empezar</button>
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
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
