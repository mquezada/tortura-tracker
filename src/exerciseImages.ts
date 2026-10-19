// Fotos de Free Exercise DB (dominio público): https://github.com/yuhonas/free-exercise-db
const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

export function imageUrl(path: string) {
  return IMAGE_BASE + path
}

export interface CatalogEntry {
  name: string
  folder: string
  imageCount: number
  muscle: string
}

let catalog: Promise<CatalogEntry[]> | null = null

// Se carga solo al abrir el buscador para no engordar la app
export function loadCatalog() {
  catalog ??= import('./data/exercise-catalog.json').then((m) =>
    (m.default as [string, string, number, string][]).map(([name, folder, imageCount, muscle]) => ({
      name,
      folder,
      imageCount,
      muscle,
    })),
  )
  return catalog
}

export const EMOJIS = ['🏋️', '💪', '🦵', '🍑', '🫁', '🏃', '🚴', '🚣', '🤸', '🧘', '🧗', '🥊', '🦾', '🔥', '⏱️', '🎯']
