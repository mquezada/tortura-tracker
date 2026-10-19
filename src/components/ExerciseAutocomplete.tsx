import { useMemo, useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  onPick: (name: string) => void
  // Ejercicios ya creados (van primero) y nombres de Free Exercise DB
  mine: string[]
  library: string[]
}

const MAX_SUGGESTIONS = 8

// Lista propia en vez de <datalist>: en Android el datalist se dibuja sobre el teclado
export default function ExerciseAutocomplete({ value, onChange, onPick, mine, library }: Props) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    const words = value.toLowerCase().split(/\s+/).filter(Boolean)
    const matches = (name: string) => words.every((w) => name.toLowerCase().includes(w))
    const own = mine.filter(matches)
    const ownLower = new Set(mine.map((n) => n.toLowerCase()))
    // Sin texto: solo los propios. Con texto: propios y luego el catálogo
    const lib = words.length ? library.filter((n) => !ownLower.has(n.toLowerCase()) && matches(n)) : []
    return [...own, ...lib].slice(0, MAX_SUGGESTIONS)
  }, [value, mine, library])

  function focus() {
    setOpen(true)
    // Esperar a que aparezca el teclado y subir el campo para que la lista quede visible
    setTimeout(() => inputRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 300)
  }

  return (
    <div className={`autocomplete grow${open ? ' open' : ''}`}>
      <input
        ref={inputRef}
        placeholder="Agregar ejercicio…"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={focus}
        onBlur={() => setOpen(false)}
        autoComplete="off"
        enterKeyHint="done"
      />
      {open && suggestions.length > 0 && (
        <ul className="suggestions" role="listbox">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                role="option"
                // mousedown en vez de click: así el input no pierde el foco antes de elegir
                onMouseDown={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  inputRef.current?.blur()
                  onPick(name)
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
