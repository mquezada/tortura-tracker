import { useEffect, useState, type FormEvent } from 'react'
import type { Exercise, Profile, WorkoutSet } from '../supabase'
import ExerciseThumb from './ExerciseThumb'

interface Props {
  exercise: Exercise
  profiles: Profile[]
  userId: string
  sets: WorkoutSet[]
  onAddSet: (forUser: string, weight: number, reps: number) => void
  onUpdateSet: (setId: string, weight: number, reps: number) => void
  onDeleteSet: (setId: string) => void
  onRemove: () => void
  onOpenImage: () => void
  onRename: (name: string) => Promise<boolean>
}

function parseSet(weight: string, reps: string) {
  const w = Number(weight.replace(',', '.'))
  const r = Number(reps)
  if (!Number.isFinite(w) || w < 0 || !Number.isInteger(r) || r <= 0) return null
  return { w, r }
}

export default function ExerciseCard({
  exercise,
  profiles,
  userId,
  sets,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onRemove,
  onOpenImage,
  onRename,
}: Props) {
  const [forUser, setForUser] = useState(userId)
  const [editing, setEditing] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const lastForUser = sets.filter((s) => s.user_id === forUser).at(-1)

  // Precargar con la última serie de la persona elegida para anotar rápido la siguiente
  useEffect(() => {
    if (lastForUser) {
      setWeight(String(Number(lastForUser.weight_kg)))
      setReps(String(lastForUser.reps))
    }
  }, [lastForUser?.id])

  function submit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseSet(weight, reps)
    if (parsed) onAddSet(forUser, parsed.w, parsed.r)
  }

  return (
    <section className="card stack">
      <header className="topbar">
        <div className="exercise-title">
          <button className="thumb-button" onClick={onOpenImage} aria-label={`Imagen de ${exercise.name}`}>
            <ExerciseThumb exercise={exercise} size={88} />
          </button>
          {renaming === null ? (
            <button className="name-button" onClick={() => setRenaming(exercise.name)} aria-label="Editar nombre">
              <h2>{exercise.name}</h2>
            </button>
          ) : (
            <form
              className="rename stack"
              onSubmit={async (e) => {
                e.preventDefault()
                const name = renaming.trim()
                if (!name || name === exercise.name || (await onRename(name))) setRenaming(null)
              }}
            >
              <input aria-label="Nombre del ejercicio" value={renaming} onChange={(e) => setRenaming(e.target.value)} autoFocus />
              <div className="row">
                <button className="link">Guardar</button>
                <button type="button" className="link muted" onClick={() => setRenaming(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
        {sets.length === 0 && renaming === null && (
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
              <h3>{p.display_name}</h3>
              {own.length === 0 && <p className="muted small">—</p>}
              <ol className="sets">
                {own.map((s) =>
                  editing === s.id ? (
                    <li key={s.id}>
                      <SetEditor
                        set={s}
                        onSave={(w, r) => {
                          onUpdateSet(s.id, w, r)
                          setEditing(null)
                        }}
                        onDelete={() => {
                          onDeleteSet(s.id)
                          setEditing(null)
                        }}
                        onCancel={() => setEditing(null)}
                      />
                    </li>
                  ) : (
                    <li key={s.id}>
                      <button className="set-button" onClick={() => setEditing(s.id)} aria-label="Editar serie">
                        {Number(s.weight_kg)} kg × {s.reps}
                      </button>
                    </li>
                  ),
                )}
              </ol>
            </div>
          )
        })}
      </div>

      <form className="stack" onSubmit={submit}>
        {profiles.length > 1 && (
          <div className="segmented" role="radiogroup" aria-label="Anotar para">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={forUser === p.id}
                className={forUser === p.id ? 'active' : ''}
                onClick={() => setForUser(p.id)}
              >
                {p.display_name}
              </button>
            ))}
          </div>
        )}
        <div className="row">
          <label className="grow">
            kg
            <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} required />
          </label>
          <label className="grow">
            reps
            <input inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} required />
          </label>
          <button className="primary">+ Serie</button>
        </div>
      </form>
    </section>
  )
}

interface EditorProps {
  set: WorkoutSet
  onSave: (weight: number, reps: number) => void
  onDelete: () => void
  onCancel: () => void
}

function SetEditor({ set, onSave, onDelete, onCancel }: EditorProps) {
  const [weight, setWeight] = useState(String(Number(set.weight_kg)))
  const [reps, setReps] = useState(String(set.reps))

  function submit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseSet(weight, reps)
    if (parsed) onSave(parsed.w, parsed.r)
  }

  return (
    <form className="set-editor" onSubmit={submit}>
      <div className="row">
        <input aria-label="kg" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} required autoFocus />
        <span className="muted">×</span>
        <input aria-label="reps" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} required />
      </div>
      <div className="row">
        <button className="link">Guardar</button>
        <button type="button" className="link danger" onClick={onDelete}>
          Borrar
        </button>
        <button type="button" className="link muted" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
