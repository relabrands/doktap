
-- Fix 1: search_path en tg_set_updated_at
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- Fix 2: política de inserción del quiz con validación mínima
drop policy if exists "Anyone can submit quiz" on public.patients;
create policy "Anyone can submit quiz"
  on public.patients for insert
  to anon, authenticated
  with check (
    length(full_name) between 2 and 200
    and length(email) between 3 and 200
    and length(phone) between 3 and 50
    and height_cm > 0
    and current_weight_kg > 0
    and goal_weight_kg > 0
  );

-- Fix 3: revocar EXECUTE público en has_role
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
