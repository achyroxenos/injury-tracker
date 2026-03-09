-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create injuries table
create table public.injuries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  type text not null check (type in ('injury', 'illness')),
  body_part text not null,
  cause text,
  status text not null default 'healing' check (status in ('healing', 'worsening', 'stagnant', 'healed')),
  archived boolean default false,
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create logs table (linked to injuries)
create table public.logs (
  id uuid default uuid_generate_v4() primary key,
  injury_id uuid references public.injuries(id) on delete cascade not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  image_url text, -- Can be UploadThing URL or Base64 (legacy)
  pain_level integer not null check (pain_level between 0 and 10),
  notes text,
  temperature numeric,
  symptoms text[], -- Array of strings
  treatments jsonb, -- Store complex treatment objects as JSON
  activity_level text check (activity_level in ('low', 'medium', 'high'))
);

-- 3. Performance indexes
create index if not exists injuries_user_id_idx on public.injuries(user_id);
create index if not exists logs_injury_id_idx on public.logs(injury_id);

-- 4. Keep injuries.last_updated current on every update
create or replace function public.set_last_updated()
returns trigger as $$
begin
  new.last_updated = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_injuries_last_updated on public.injuries;
create trigger set_injuries_last_updated
before update on public.injuries
for each row
execute function public.set_last_updated();

-- 5. Row Level Security (RLS) - Secure Mode
alter table public.injuries enable row level security;
alter table public.logs enable row level security;

-- Strict access: Users can only see, insert, update, or delete their own injuries
create policy "Users can manage their own injuries" 
  on public.injuries 
  for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Logs access: Users can only manage logs tied to an injury they own
create policy "Users can manage logs for their injuries"
  on public.logs
  for all
  using (
    exists (
      select 1 from public.injuries
      where public.injuries.id = public.logs.injury_id
      and public.injuries.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.injuries
      where public.injuries.id = public.logs.injury_id
      and public.injuries.user_id = auth.uid()
    )
  );
