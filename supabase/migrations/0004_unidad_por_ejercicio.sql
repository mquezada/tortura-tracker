-- Cada ejercicio se anota en kg o en lb; el peso de las series queda en la unidad del ejercicio.
alter table public.exercises
  add column unit text not null default 'kg' check (unit in ('kg', 'lb'));

alter table public.sets rename column weight_kg to weight;
