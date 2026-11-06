-- Өсімдік дәрігері: диагноздар мен пікірлер кестесі
-- Таблица диагнозов и отзывов. Сайт пишет сюда с сервера (service role key),
-- поэтому RLS включён и публичного доступа нет.

create table if not exists public.plant_diagnoses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lang text,
  client_id text,
  plant_name text,
  latin_name text,
  health_status text,
  diagnosis text,
  confidence int,
  result jsonb,
  feedback text check (feedback in ('up', 'down')),
  feedback_comment text,
  feedback_at timestamptz,
  chat_messages int not null default 0
);

create index if not exists plant_diagnoses_created_at_idx on public.plant_diagnoses (created_at desc);

alter table public.plant_diagnoses enable row level security;
-- Политик нет намеренно: anon/authenticated не видят таблицу, доступ только с сервера.

create or replace function public.plant_increment_chat(diag_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.plant_diagnoses set chat_messages = chat_messages + 1 where id = diag_id;
$$;

revoke execute on function public.plant_increment_chat(uuid) from public, anon, authenticated;
