-- Cualquiera de los dos puede crear, editar y borrar series de cualquiera.
-- Pegar en Supabase → SQL Editor → Run (después de 0001).

drop policy "crear mis series" on public.sets;
drop policy "editar mis series" on public.sets;
drop policy "borrar mis series" on public.sets;

create policy "crear series" on public.sets for insert to authenticated with check (true);
create policy "editar series" on public.sets for update to authenticated using (true) with check (true);
create policy "borrar series" on public.sets for delete to authenticated using (true);
