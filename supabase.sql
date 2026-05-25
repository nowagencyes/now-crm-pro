create extension if not exists "pgcrypto";

create table if not exists clientes (
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
encargado text, telefono text, email text, empresa text, direccion_empresa text, cif text,
telefono_empresa text, email_empresa text, pack text, estado text, notas text);

create table if not exists facturas (
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
numero text, tipo text, cliente text, concepto text, base numeric default 0,
igic_pct numeric default 7, igic numeric default 0, total numeric default 0, estado text);

create table if not exists gastos (
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
fecha date, proveedor text, concepto text, categoria text, base numeric default 0,
igic_pct numeric default 7, igic numeric default 0, total numeric default 0, metodo text, notas text);

create table if not exists produccion (
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
proyecto text, cliente text, fecha date, estado text, notas text);

create table if not exists redes (
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
cliente text, instagram text, instagram_pass text, tiktok text, tiktok_pass text,
facebook text, facebook_pass text, google text, google_pass text, notas text);

create table if not exists planner (
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
proyecto text, fecha date, hora time, cliente text, red text, tipo text, estado text,
caption text, hashtags text, archivos text);

create table if not exists tareas (
id uuid primary key default gen_random_uuid(),
created_at timestamptz default now(),
fecha date, hora time, cliente text, tipo text, titulo text, notas text);

alter publication supabase_realtime add table clientes;
alter publication supabase_realtime add table facturas;
alter publication supabase_realtime add table gastos;
alter publication supabase_realtime add table produccion;
alter publication supabase_realtime add table redes;
alter publication supabase_realtime add table planner;
alter publication supabase_realtime add table tareas;

alter table clientes enable row level security;
alter table facturas enable row level security;
alter table gastos enable row level security;
alter table produccion enable row level security;
alter table redes enable row level security;
alter table planner enable row level security;
alter table tareas enable row level security;

create policy "public clientes" on clientes for all using (true) with check (true);
create policy "public facturas" on facturas for all using (true) with check (true);
create policy "public gastos" on gastos for all using (true) with check (true);
create policy "public produccion" on produccion for all using (true) with check (true);
create policy "public redes" on redes for all using (true) with check (true);
create policy "public planner" on planner for all using (true) with check (true);
create policy "public tareas" on tareas for all using (true) with check (true);
