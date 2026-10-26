import { useCallback, useState, type SetStateAction } from 'react'

// Caché simple guardado en el celular: cada vista muestra al instante lo último que vio
// y después se actualiza desde Supabase por detrás.
const PREFIX = 'tt-cache:'
const memory = new Map<string, unknown>()

export function readCache<T>(key: string): T | undefined {
  if (memory.has(key)) return memory.get(key) as T
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return undefined
    const value = JSON.parse(raw) as T
    memory.set(key, value)
    return value
  } catch {
    return undefined
  }
}

export function writeCache<T>(key: string, value: T) {
  memory.set(key, value)
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Sin espacio o almacenamiento bloqueado: queda solo en memoria
  }
}

export function clearCache() {
  memory.clear()
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    // nada que limpiar
  }
}

// Como useState, pero parte del valor guardado y guarda cada cambio
export function useCachedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readCache<T>(key) ?? initial)
  const set = useCallback(
    (action: SetStateAction<T>) =>
      setValue((prev) => {
        const next = typeof action === 'function' ? (action as (p: T) => T)(prev) : action
        writeCache(key, next)
        return next
      }),
    [key],
  )
  return [value, set] as const
}
