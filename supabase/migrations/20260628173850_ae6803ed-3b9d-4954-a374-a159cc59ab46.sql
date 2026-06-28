
-- Enum de roles
create type public.app_role as enum ('admin', 'doctor');

-- Tabla de roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- Función security definer para chequear rol sin recursión
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Users can see own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- Tabla principal de pacientes (quiz)
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  province text,
  cedula text,
  sex text not null,                          -- 'male' | 'female'
  date_of_birth date,
  height_cm numeric(5,1) not null,
  current_weight_kg numeric(6,2) not null,
  goal_weight_kg numeric(6,2) not null,
  pace_choice text,                           -- 'works' | 'faster' | 'too_fast'
  conditions jsonb not null default '[]'::jsonb,
  medications text,
  allergies text,
  blood_pressure_range text,                  -- 'normal' | 'elevated' | 'high1' | 'high2' | 'crisis' | 'unknown'
  pregnant_or_nursing boolean default false,
  prior_glp1 boolean default false,
  status text not null default 'new',         -- 'new' | 'contacted' | 'approved' | 'rejected'
  doctor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant insert on public.patients to anon;
grant select, insert, update on public.patients to authenticated;
grant all on public.patients to service_role;

alter table public.patients enable row level security;

-- Cualquiera puede enviar el quiz
create policy "Anyone can submit quiz"
  on public.patients for insert
  to anon, authenticated
  with check (true);

-- Solo doctores/admins pueden ver
create policy "Doctors view patients"
  on public.patients for select
  to authenticated
  using (public.has_role(auth.uid(), 'doctor') or public.has_role(auth.uid(), 'admin'));

create policy "Doctors update patients"
  on public.patients for update
  to authenticated
  using (public.has_role(auth.uid(), 'doctor') or public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'doctor') or public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.tg_set_updated_at();

-- Cuando un usuario se registra, si su email está en una whitelist de doctores,
-- se le asigna el rol automáticamente (de momento vacía; se asignan manualmente).
-- Helper que el admin puede usar para asignar rol via SQL.
