import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example)')
}

// Leer antes de crear el cliente: Supabase limpia el hash de la URL al procesarlo
export const openedFromRecoveryLink = window.location.hash.includes('type=recovery')

export const supabase = createClient(url, anonKey)

export interface Profile {
  id: string
  display_name: string
}

export interface Exercise {
  id: string
  name: string
}

export interface RoutineDay {
  id: string
  name: string
  position: number
}

export interface Session {
  id: string
  date: string
  routine_day_id: string | null
  notes: string | null
  routine_days: { name: string } | null
}

export interface SessionExercise {
  id: string
  exercise_id: string
  position: number
  exercises: Exercise
}

export interface WorkoutSet {
  id: string
  session_id: string
  exercise_id: string
  user_id: string
  weight_kg: number
  reps: number
  created_at: string
}
