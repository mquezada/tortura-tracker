# Tortura Tracker

App web para anotar los entrenamientos del gimnasio entre dos personas que hacen la misma rutina.
Cada uno entra con su cuenta, anota sus series (peso × repeticiones) y ve al instante lo que anota el otro.

**Stack:** React + Vite + TypeScript · Supabase (Postgres, login, tiempo real) · Netlify

## Puesta en marcha

### 1. Crear el proyecto en Supabase
1. Crear un proyecto gratis en [supabase.com](https://supabase.com).
2. Ir a **SQL Editor** y ejecutar, en orden, cada archivo de [`supabase/migrations/`](supabase/migrations/)
   (`0001_init.sql`, `0002_editar_series_del_otro.sql`, …).
3. En **Authentication → Sign In / Providers → Email**, desactivar *Confirm email* (más simple para dos personas) o dejarlo activo y confirmar desde el correo.

### 2. Correr la app en local
```bash
cp .env.example .env   # y completar con Project Settings → API (URL y anon key)
npm install
npm run dev
```

### 3. Crear las dos cuentas
En Supabase → **Authentication → URL Configuration**, poner la URL del sitio como *Site URL* y agregarla en
*Redirect URLs* (`https://<sitio>/**`). Después, en **Authentication → Users → Invite user**, invitar a cada
persona por correo: el enlace abre la app para elegir contraseña. El nombre que se muestra en la app se cambia
en la tabla `profiles` (`display_name`).

### 4. Publicar en Netlify
En [netlify.com](https://netlify.com): *Add new site → Import an existing project*, elegir este repo y la rama `main`
(la configuración de build ya está en `netlify.toml`). En *Site configuration → Environment variables*, agregar
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, y volver a desplegar. Desde el celular: abrir la URL → *Agregar a pantalla de inicio*.

## Cómo se usa
- **Nueva sesión:** elegir la fecha (y el día de rutina, cuando esté cargada) → *Empezar*.
- **Agregar ejercicio:** escribir el nombre; se autocompleta con los ya usados.
- **Anotar serie:** elegir para quién (*Yo* o el otro), kg + reps → *+ Serie*. Los campos quedan con la última
  serie de esa persona para anotar la siguiente rápido.
- **Editar o borrar una serie:** tocarla. Cualquiera de los dos puede editar las series del otro.
- **Imagen del ejercicio:** al crear un ejercicio se abre un buscador (en inglés) con fotos de
  [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (dominio público), o se puede elegir un emoji.
  Tocar la miniatura muestra las fotos en grande y permite cambiarla.

## Modelo de datos
| Tabla | Qué guarda |
|---|---|
| `profiles` | Nombre de cada usuario |
| `exercises` | Catálogo de ejercicios (con foto o emoji) |
| `routine_days`, `routine_exercises` | La rutina (días y ejercicios con series/reps objetivo) |
| `sessions` | Un entrenamiento compartido (fecha, día de rutina) |
| `session_exercises` | Ejercicios de esa sesión |
| `sets` | Cada serie: persona, ejercicio, peso, repeticiones |

## Pendiente
- Cargar la rutina (días y ejercicios).
