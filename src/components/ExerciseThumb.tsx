import type { Exercise } from '../supabase'
import { imageUrl } from '../exerciseImages'

export default function ExerciseThumb({ exercise, size = 48 }: { exercise: Exercise; size?: number }) {
  const style = { width: size, height: size }
  if (exercise.image_path) {
    return <img className="thumb" style={style} src={imageUrl(exercise.image_path)} alt="" loading="lazy" />
  }
  return (
    <span className={exercise.emoji ? 'thumb emoji' : 'thumb empty'} style={{ ...style, fontSize: size * 0.55 }}>
      {exercise.emoji ?? '＋'}
    </span>
  )
}
