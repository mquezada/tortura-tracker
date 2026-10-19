import { useEffect, useMemo, useState } from 'react'
import type { Exercise } from '../supabase'
import { EMOJIS, imageUrl, loadCatalog, type CatalogEntry } from '../exerciseImages'

export interface ImageChoice {
  image_path: string | null
  emoji: string | null
}

interface Props {
  exercise: Exercise
  onSave: (choice: ImageChoice) => void
  onClose: () => void
}

const MAX_RESULTS = 30

export default function ImagePicker({ exercise, onSave, onClose }: Props) {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  const [query, setQuery] = useState(exercise.name)

  useEffect(() => {
    loadCatalog().then(setCatalog)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length === 0) return []
    return catalog
      .filter((c) => {
        const text = `${c.name} ${c.muscle}`.toLowerCase()
        return words.every((w) => text.includes(w))
      })
      .slice(0, MAX_RESULTS)
  }, [catalog, query])

  const current = exercise.image_path?.split('/')[0]
  const currentEntry = current ? catalog.find((c) => c.folder === current) : undefined

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet stack" role="dialog" aria-label={`Imagen de ${exercise.name}`} onClick={(e) => e.stopPropagation()}>
        <header className="topbar">
          <h2>{exercise.name}</h2>
          <button className="link" onClick={onClose}>
            Cerrar
          </button>
        </header>

        {exercise.image_path && (
          <div className="stack">
            <div className="photos">
              {Array.from({ length: currentEntry?.imageCount ?? 1 }, (_, i) => (
                <img key={i} src={imageUrl(`${current}/${i}.jpg`)} alt={`${exercise.name}, paso ${i + 1}`} />
              ))}
            </div>
            {currentEntry && <p className="muted small">{currentEntry.name}</p>}
          </div>
        )}

        <input
          type="search"
          placeholder="Buscar en inglés: bench press, curl, squat…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Si ya tiene imagen, probablemente solo la quiere ver: no abrir el teclado
          autoFocus={!exercise.image_path && !exercise.emoji}
        />

        <div className="emoji-row" aria-label="Usar un emoji">
          {EMOJIS.map((e) => (
            <button
              key={e}
              className={exercise.emoji === e && !exercise.image_path ? 'active' : ''}
              onClick={() => onSave({ image_path: null, emoji: e })}
            >
              {e}
            </button>
          ))}
        </div>

        {catalog.length === 0 && <p className="muted small">Cargando catálogo…</p>}
        {catalog.length > 0 && query.trim() && results.length === 0 && (
          <p className="muted small">Sin resultados. Prueba con otra palabra en inglés.</p>
        )}
        <ul className="results">
          {results.map((c) => (
            <li key={c.folder}>
              <button
                className={c.folder === current ? 'active' : ''}
                onClick={() => onSave({ image_path: `${c.folder}/0.jpg`, emoji: null })}
              >
                <img src={imageUrl(`${c.folder}/0.jpg`)} alt="" loading="lazy" />
                <span>{c.name}</span>
                <span className="muted small">{c.muscle}</span>
              </button>
            </li>
          ))}
        </ul>

        {(exercise.image_path || exercise.emoji) && (
          <button className="link danger" onClick={() => onSave({ image_path: null, emoji: null })}>
            Quitar imagen
          </button>
        )}
      </div>
    </div>
  )
}
