-- Өсімдіктер картасы / Карта растений (Supabase-те қолданылды)
create table if not exists public.plant_observations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id text,
  lat numeric(8,5) not null check (lat between -90 and 90),
  lon numeric(8,5) not null check (lon between -180 and 180),
  plant_name text not null check (char_length(plant_name) <= 80),
  latin_name text check (char_length(latin_name) <= 80),
  health_status text check (health_status in ('healthy','needs_attention','sick','unknown')),
  diagnosis text check (char_length(diagnosis) <= 160),
  protected boolean not null default false,
  lang text
);
create index if not exists plant_observations_geo_idx on public.plant_observations (lat, lon);
create index if not exists plant_observations_created_idx on public.plant_observations (created_at desc);
create index if not exists plant_observations_client_idx on public.plant_observations (client_id, created_at desc);
alter table public.plant_observations enable row level security;
