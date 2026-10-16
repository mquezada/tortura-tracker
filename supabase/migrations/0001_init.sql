-- Tortura Tracker: esquema inicial
-- Pegar en Supabase → SQL Editor → Run.

-- Perfil de cada usuario (se crea solo al registrarse)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Catálogo de ejercicios
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Rutina: días (ej. "Día A – Pecho") y sus ejercicios
create table public.routine_days (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position int not null default 0
);

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position int not null default 0,
  target_sets int,
  target_reps text
);

-- Sesión de entrenamiento (compartida entre los dos)
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  routine_day_id uuid references public.routine_days (id) on delete set null,
  notes text,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- Ejercicios incluidos en una sesión
create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position int not null default 0,
  unique (session_id, exercise_id)
);

-- Series: lo que cada persona hizo (peso × repeticiones)
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  weight_kg numeric(6, 2) not null check (weight_kg >= 0),
  reps int not null check (reps > 0),
  created_at timestamptz not null default now()
);

create index sets_session_idx on public.sets (session_id);
create index sets_user_exercise_idx on public.sets (user_id, exercise_id, created_at desc);

-- Seguridad: solo usuarios con sesión iniciada.
-- Todo es visible para ambos; cada uno solo puede modificar sus propias series.
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routine_days enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.sets enable row level security;

create policy "leer perfiles" on public.profiles for select to authenticated using (true);
create policy "editar mi perfil" on public.profiles for update to authenticated using (id = auth.uid());

create policy "todo ejercicios" on public.exercises for all to authenticated using (true) with check (true);
create policy "todo dias" on public.routine_days for all to authenticated using (true) with check (true);
create policy "todo rutina" on public.routine_exercises for all to authenticated using (true) with check (true);
create policy "todo sesiones" on public.sessions for all to authenticated using (true) with check (true);
create policy "todo ejercicios sesion" on public.session_exercises for all to authenticated using (true) with check (true);

create policy "leer series" on public.sets for select to authenticated using (true);
create policy "crear mis series" on public.sets for insert to authenticated with check (user_id = auth.uid());
create policy "editar mis series" on public.sets for update to authenticated using (user_id = auth.uid());
create policy "borrar mis series" on public.sets for delete to authenticated using (user_id = auth.uid());

-- Tiempo real: ver al instante lo que anota el otro
alter publication supabase_realtime add table public.sets, public.session_exercises;
