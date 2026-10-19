-- Imagen de cada ejercicio: una foto de Free Exercise DB o un emoji.
-- image_path es la ruta dentro de github.com/yuhonas/free-exercise-db/exercises (ej. "Barbell_Squat/0.jpg").
alter table public.exercises
  add column image_path text,
  add column emoji text;
