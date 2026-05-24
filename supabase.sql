-- NOW CRM PRO V2 - Supabase limpio
create extension if not exists "pgcrypto";

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  created_at timestamptz default now(),
  nombre text,
  empresa text,
  email text,
  servicio text,
  estado text
);

create table if not exists facturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  created_at timestamptz default now(),
  numero text,
  tipo text default 'Proforma',
  cliente text,
  concepto text,
  base numeric default 0,
  igic numeric default 7,
  estado text
);

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  created_at timestamptz default now(),
  fecha date,
  hora time,
  cliente text,
  red text,
  tipo text,
  caption text,
  hashtags text,
  estado text
);

create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  created_at timestamptz default now(),
  platform text,
  account_name text,
  status text,
  access_token text,
  refresh_token text,
  expires_at timestamptz
);

create table if not exists proyectos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  created_at timestamptz default now(),
  proyecto text,
  cliente text,
  fecha date,
  estado text,
  notas text
);

create table if not exists accesos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  created_at timestamptz default now(),
  cliente text,
  instagram text,
  tiktok text,
  facebook text,
  email text,
  notas text
);

alter table clientes enable row level security;
alter table facturas enable row level security;
alter table social_posts enable row level security;
alter table social_accounts enable row level security;
alter table proyectos enable row level security;
alter table accesos enable row level security;

create policy "own clientes" on clientes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own facturas" on facturas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own social_posts" on social_posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own social_accounts" on social_accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own proyectos" on proyectos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own accesos" on accesos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
