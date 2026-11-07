-- Аккаунт деректері (Google арқылы кіргендер үшін). Әркім тек өз жолын көреді (RLS).
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  plants jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint user_data_size check (octet_length(plants::text) + octet_length(history::text) < 4000000)
);
alter table public.user_data enable row level security;
create policy "user_data own select" on public.user_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_data own insert" on public.user_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_data own update" on public.user_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "user_data own delete" on public.user_data for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.user_data from anon;
grant select, insert, update, delete on public.user_data to authenticated;
