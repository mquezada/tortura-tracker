import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  supabase,
  type Exercise,
  type Profile,
  type Session,
  type SessionExercise,
  type WorkoutSet,
} from '../supabase'
import { useAuth } from '../auth'
import { formatDate } from '../dates'
import ExerciseCard from '../components/ExerciseCard'
import ImagePicker, { type ImageChoice } from '../components/ImagePicker'
import { loadCatalog, type CatalogEntry } from '../exerciseImages'

export default function SessionDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const userId = useAuth().session!.user.id
  const [session, setSession] = useState<Session | null>(null)
  const [items, setItems] = useState<SessionExercise[]>([])
  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [newExercise, setNewExercise] = useState('')
  const [picking, setPicking] = useState<Exercise | null>(null)
  // Ejercicios de Free Exercise DB, para sugerir nombres con foto
  const [library, setLibrary] = useState<CatalogEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from('session_exercises')
      .select('id, exercise_id, position, exercises(id, name, image_path, emoji)')
      .eq('session_id', id)
      .order('position')
    setItems((data as unknown as SessionExercise[]) ?? [])
  }, [id])

  const loadSets = useCallback(async () => {
    const { data } = await supabase.from('sets').select('*').eq('session_id', id).order('created_at')
    setSets((data as WorkoutSet[]) ?? [])
  }, [id])

  useEffect(() => {
    supabase
      .from('sessions')
      .select('id, date, routine_day_id, notes, routine_days(name)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setSession(data as unknown as Session)
      })
    supabase
      .from('profiles')
      .select('*')
      .then(({ data }) => {
        // Yo primero
        const list = (data as Profile[]) ?? []
        setProfiles(list.sort((a, b) => Number(b.id === userId) - Number(a.id === userId)))
      })
    supabase
      .from('exercises')
      .select('id, name, image_path, emoji')
      .order('name')
      .then(({ data }) => setCatalog((data as Exercise[]) ?? []))
    loadCatalog().then(setLibrary)
    loadItems()
    loadSets()

    // Recargar cuando el otro anota algo
    const channel = supabase
      .channel(`session-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sets' }, loadSets)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_exercises' }, loadItems)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, userId, loadItems, loadSets])

  async function addExercise(e: FormEvent) {
    e.preventDefault()
    const name = newExercise.trim()
    if (!name) return
    setError(null)

    let exercise = catalog.find((x) => x.name.toLowerCase() === name.toLowerCase())
    if (!exercise) {
      // Si el nombre es de Free Exercise DB, crearlo con su foto
      const fromLibrary = library.find((x) => x.name.toLowerCase() === name.toLowerCase())
      const { data, error } = await supabase
        .from('exercises')
        .insert(fromLibrary ? { name: fromLibrary.name, image_path: `${fromLibrary.folder}/0.jpg` } : { name })
        .select('id, name, image_path, emoji')
        .single()
      if (error) return setError(error.message)
      exercise = data as Exercise
      setCatalog([...catalog, exercise].sort((a, b) => a.name.localeCompare(b.name)))
      // Ejercicio nuevo sin foto: ofrecer elegirle imagen de inmediato
      if (!fromLibrary) setPicking(exercise)
    }
    if (items.some((i) => i.exercise_id === exercise.id)) return setNewExercise('')

    const position = items.reduce((max, i) => Math.max(max, i.position), -1) + 1
    const { error } = await supabase
      .from('session_exercises')
      .insert({ session_id: id, exercise_id: exercise.id, position })
    if (error) return setError(error.message)
    setNewExercise('')
    loadItems()
  }

  async function saveImage(exercise: Exercise, choice: ImageChoice) {
    setPicking(null)
    const { error } = await supabase.from('exercises').update(choice).eq('id', exercise.id)
    if (error) return setError(error.message)
    setCatalog(catalog.map((x) => (x.id === exercise.id ? { ...x, ...choice } : x)))
    loadItems()
  }

  async function addSet(exerciseId: string, forUser: string, weight: number, reps: number) {
    const { error } = await supabase
      .from('sets')
      .insert({ session_id: id, exercise_id: exerciseId, user_id: forUser, weight_kg: weight, reps })
    if (error) setError(error.message)
    else loadSets()
  }

  async function updateSet(setId: string, weight: number, reps: number) {
    const { error } = await supabase.from('sets').update({ weight_kg: weight, reps }).eq('id', setId)
    if (error) setError(error.message)
    else loadSets()
  }

  async function deleteSet(setId: string) {
    const { error } = await supabase.from('sets').delete().eq('id', setId)
    if (error) setError(error.message)
    else loadSets()
  }

  async function removeExercise(itemId: string) {
    const { error } = await supabase.from('session_exercises').delete().eq('id', itemId)
    if (error) setError(error.message)
    else loadItems()
  }

  async function deleteSession() {
    if (!confirm('¿Borrar esta sesión y todas sus series (de los dos)?')) return
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) setError(error.message)
    else navigate('/')
  }

  if (!session) return <p className="center muted">{error ?? 'Cargando…'}</p>

  return (
    <main className="page">
      <header className="topbar">
        <Link to="/" className="link">
          ← Sesiones
        </Link>
        <button className="link danger" onClick={deleteSession}>
          Borrar
        </button>
      </header>
      <h1 className="capitalize">{formatDate(session.date)}</h1>
      {session.routine_days && <p className="muted">{session.routine_days.name}</p>}

      {error && <p className="error">{error}</p>}

      {items.map((item) => (
        <ExerciseCard
          key={item.id}
          exercise={item.exercises}
          profiles={profiles}
          userId={userId}
          sets={sets.filter((s) => s.exercise_id === item.exercise_id)}
          onAddSet={(forUser, w, r) => addSet(item.exercise_id, forUser, w, r)}
          onUpdateSet={updateSet}
          onDeleteSet={deleteSet}
          onRemove={() => removeExercise(item.id)}
          onOpenImage={() => setPicking(item.exercises)}
        />
      ))}

      <form className="card row" onSubmit={addExercise}>
        <input
          className="grow"
          list="exercise-catalog"
          placeholder="Agregar ejercicio…"
          value={newExercise}
          onChange={(e) => setNewExercise(e.target.value)}
        />
        <datalist id="exercise-catalog">
          {catalog.map((x) => (
            <option key={x.id} value={x.name} />
          ))}
          {library
            .filter((x) => !catalog.some((c) => c.name.toLowerCase() === x.name.toLowerCase()))
            .map((x) => (
              <option key={x.folder} value={x.name} />
            ))}
        </datalist>
        <button className="primary">Agregar</button>
      </form>

      {picking && (
        <ImagePicker
          exercise={picking}
          onSave={(choice) => saveImage(picking, choice)}
          onClose={() => setPicking(null)}
        />
      )}
    </main>
  )
}
