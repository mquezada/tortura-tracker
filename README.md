# Tortura Tracker

App web para anotar los entrenamientos del gimnasio entre dos personas que hacen la misma rutina.
Cada uno entra con su cuenta, anota sus series (peso × repeticiones) y ve al instante lo que anota el otro.

**Stack:** React + Vite + TypeScript · Supabase (Postgres, login, tiempo real) · Vercel

## Puesta en marcha

### 1. Crear el proyecto en Supabase
1. Crear un proyecto gratis en [supabase.com](https://supabase.com).
2. Ir a **SQL Editor**, pegar el contenido de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) y ejecutarlo.
3. En **Authentication → Sign In / Providers → Email**, desactivar *Confirm email* (más simple para dos personas) o dejarlo activo y confirmar desde el correo.

### 2. Correr la app en local
```bash
cp .env.example .env   # y completar con Project Settings → API (URL y anon key)
npm install
npm run dev
```

### 3. Crear las dos cuentas
Abrir la app, tocar **Regístrate** y crear una cuenta cada uno.
Después, en Supabase → **Authentication → Sign In / Providers**, desactivar *Allow new users to sign up*
para que nadie más pueda registrarse.

### 4. Publicar en Vercel
Importar el repo en [vercel.com](https://vercel.com), agregar las variables `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY`, y desplegar. Desde el celular: abrir la URL → *Agregar a pantalla de inicio*.

## Cómo se usa
- **Nueva sesión:** elegir la fecha (y el día de rutina, cuando esté cargada) → *Empezar*.
- **Agregar ejercicio:** escribir el nombre; se autocompleta con los ya usados.
- **Anotar serie:** kg + reps → *+ Serie*. Los campos quedan con la última serie para anotar la siguiente rápido.
- Cada uno solo puede borrar sus propias series.

## Modelo de datos
| Tabla | Qué guarda |
|---|---|
| `profiles` | Nombre de cada usuario |
| `exercises` | Catálogo de ejercicios |
| `routine_days`, `routine_exercises` | La rutina (días y ejercicios con series/reps objetivo) |
| `sessions` | Un entrenamiento compartido (fecha, día de rutina) |
| `session_exercises` | Ejercicios de esa sesión |
| `sets` | Cada serie: persona, ejercicio, peso, repeticiones |

## Pendiente
- Cargar la rutina (días y ejercicios).
