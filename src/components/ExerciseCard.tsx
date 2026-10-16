import { useEffect, useState, type FormEvent } from 'react'
import type { Exercise, Profile, WorkoutSet } from '../supabase'

interface Props {
  exercise: Exercise
  profiles: Profile[]
  userId: string
  sets: WorkoutSet[]
  onAddSet: (weight: number, reps: number) => void
  onDeleteSet: (setId: string) => void
  onRemove: () => void
}

export default function ExerciseCard({ exercise, profiles, userId, sets, onAddSet, onDeleteSet, onRemove }: Props) {
  const mySets = sets.filter((s) => s.user_id === userId)
  const lastMine = mySets.at(-1)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  // Precargar con mi última serie para anotar rápido la siguiente
  useEffect(() => {
    if (lastMine) {
      setWeight(String(lastMine.weight_kg))
      setReps(String(lastMine.reps))
    }
  }, [lastMine?.id])

  function submit(e: FormEvent) {
    e.preventDefault()
    const w = Number(weight.replace(',', '.'))
    const r = Number(reps)
    if (!Number.isFinite(w) || w < 0 || !Number.isInteger(r) || r <= 0) return
    onAddSet(w, r)
  }

  return (
    <section className="card stack">
      <header className="topbar">
        <h2>{exercise.name}</h2>
        {sets.length === 0 && (
          <button className="link muted" onClick={onRemove} aria-label="Quitar ejercicio">
            Quitar
          </button>
        )}
      </header>

      <div className="people">
        {profiles.map((p) => {
          const own = sets.filter((s) => s.user_id === p.id)
          return (
            <div key={p.id} className="person">
              <h3>{p.id === userId ? 'Yo' : p.display_name}</h3>
              {own.length === 0 && <p className="muted small">—</p>}
              <ol className="sets">
                {own.map((s) => (
                  <li key={s.id}>
                    <span>
                      {Number(s.weight_kg)} kg × {s.reps}
                    </span>
                    {p.id === userId && (
                      <button className="link danger small" onClick={() => onDeleteSet(s.id)} aria-label="Borrar serie">
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>

      <form className="row" onSubmit={submit}>
        <label className="grow">
          kg
          <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} required />
        </label>
        <label className="grow">
          reps
          <input inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} required />
        </label>
        <button className="primary align-end">+ Serie</button>
      </form>
    </section>
  )
}
