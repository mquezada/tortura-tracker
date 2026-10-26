import { supabase, type Session } from './supabase'

export const SESSION_LIST_SELECT =
  'id, date, routine_day_id, notes, routine_days(name), session_exercises(exercise_id, position, exercises(name))'

export async function fetchSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_LIST_SELECT)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as Session[]
}

export function exerciseNames(session: Session) {
  return [...(session.session_exercises ?? [])].sort((a, b) => a.position - b.position).map((e) => e.exercises.name)
}

// Sesión a copiar por defecto: la más reciente del mismo día de la semana, o si no, la más reciente
export function suggestedSource(sessions: Session[], date: string, excludeId?: string) {
  const weekday = (iso: string) => new Date(`${iso}T12:00:00`).getDay()
  const candidates = sessions.filter((s) => s.id !== excludeId && s.date <= date && s.session_exercises?.length)
  return candidates.find((s) => weekday(s.date) === weekday(date)) ?? candidates[0]
}

export async function copyExercises(fromSessionId: string, toSessionId: string) {
  const { data, error } = await supabase
    .from('session_exercises')
    .select('exercise_id, position')
    .eq('session_id', fromSessionId)
  if (error) throw error
  if (!data.length) return
  const { error: insertError } = await supabase
    .from('session_exercises')
    .insert(data.map((r) => ({ session_id: toSessionId, exercise_id: r.exercise_id, position: r.position })))
  if (insertError) throw insertError
}
