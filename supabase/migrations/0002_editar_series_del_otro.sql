-- Cualquiera de los dos puede crear, editar y borrar series de cualquiera.
-- Pegar en Supabase → SQL Editor → Run (después de 0001).

alter policy "crear mis series" on public.sets with check (true);
alter policy "crear mis series" on public.sets rename to "crear series";
alter policy "editar mis series" on public.sets using (true) with check (true);
alter policy "editar mis series" on public.sets rename to "editar series";
alter policy "borrar mis series" on public.sets using (true);
alter policy "borrar mis series" on public.sets rename to "borrar series";

-- La función del trigger no debe poder llamarse desde la API
revoke execute on function public.handle_new_user() from public, anon, authenticated;
