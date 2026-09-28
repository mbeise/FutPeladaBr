-- Apply in a new Supabase project. All access checks are enforced in Postgres.
create extension if not exists pgcrypto;
create table public.groups (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  name text not null check (length(name) between 2 and 80), logo_path text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key(group_id,user_id)
);
create table public.players (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
  name text not null check(length(name) between 2 and 80),
  positions text[] not null check(cardinality(positions) between 1 and 5),
  skill int not null check(skill between 1 and 5), speed int not null check(speed between 1 and 5),
  vision int not null check(vision between 1 and 5), passing int not null check(passing between 1 and 5),
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.games (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
  starts_at timestamptz not null, venue text not null check(length(venue) between 2 and 160),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.game_players (
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  team smallint check(team in (1,2)), goals int not null default 0 check(goals >= 0),
  primary key(game_id,player_id)
);
create table public.dinners (
  id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null, title text not null,
  event_at timestamptz not null, total_cents int not null default 0 check(total_cents >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.dinner_votes (
  dinner_id uuid not null references public.dinners(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attending boolean not null, updated_at timestamptz not null default now(),
  primary key(dinner_id,user_id)
);
create index on public.groups(owner_id);
create index on public.group_members(user_id);
create index on public.players(group_id);
create index on public.games(group_id,starts_at desc);
create index on public.dinners(group_id,event_at desc);

create schema if not exists private;
create function private.is_member(g uuid) returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.groups where id=g and owner_id=(select auth.uid()))
    or exists(select 1 from public.group_members where group_id=g and user_id=(select auth.uid()));
$$;
create function private.is_owner(g uuid) returns boolean language sql stable security definer
set search_path = '' as $$ select exists(select 1 from public.groups where id=g and owner_id=(select auth.uid())); $$;
revoke all on function private.is_member(uuid), private.is_owner(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_member(uuid), private.is_owner(uuid) to authenticated;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.dinners enable row level security;
alter table public.dinner_votes enable row level security;
create policy groups_read on public.groups for select to authenticated using (private.is_member(id));
create policy groups_insert on public.groups for insert to authenticated with check (owner_id=(select auth.uid()));
create policy groups_update on public.groups for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
create policy groups_delete on public.groups for delete to authenticated using (owner_id=(select auth.uid()));
create policy members_read on public.group_members for select to authenticated using (private.is_member(group_id));
create policy members_insert on public.group_members for insert to authenticated with check (private.is_owner(group_id));
create policy members_delete on public.group_members for delete to authenticated using (private.is_owner(group_id) or user_id=(select auth.uid()));
create policy players_read on public.players for select to authenticated using (private.is_member(group_id));
create policy players_insert on public.players for insert to authenticated with check (private.is_owner(group_id));
create policy players_update on public.players for update to authenticated using (private.is_owner(group_id)) with check (private.is_owner(group_id));
create policy players_delete on public.players for delete to authenticated using (private.is_owner(group_id));
create policy games_read on public.games for select to authenticated using (private.is_member(group_id));
create policy games_insert on public.games for insert to authenticated with check (private.is_owner(group_id));
create policy games_update on public.games for update to authenticated using (private.is_owner(group_id)) with check (private.is_owner(group_id));
create policy games_delete on public.games for delete to authenticated using (private.is_owner(group_id));
create policy game_players_read on public.game_players for select to authenticated using (exists(select 1 from public.games g where g.id=game_id and private.is_member(g.group_id)));
create policy game_players_insert on public.game_players for insert to authenticated with check (exists(select 1 from public.games g join public.players p on p.id=player_id and p.group_id=g.group_id where g.id=game_id and private.is_owner(g.group_id)));
create policy game_players_update on public.game_players for update to authenticated using (exists(select 1 from public.games g where g.id=game_id and private.is_owner(g.group_id))) with check (exists(select 1 from public.games g join public.players p on p.id=player_id and p.group_id=g.group_id where g.id=game_id and private.is_owner(g.group_id)));
create policy game_players_delete on public.game_players for delete to authenticated using (exists(select 1 from public.games g where g.id=game_id and private.is_owner(g.group_id)));
create policy dinners_read on public.dinners for select to authenticated using (private.is_member(group_id));
create policy dinners_insert on public.dinners for insert to authenticated with check (private.is_owner(group_id));
create policy dinners_update on public.dinners for update to authenticated using (private.is_owner(group_id)) with check (private.is_owner(group_id));
create policy dinners_delete on public.dinners for delete to authenticated using (private.is_owner(group_id));
create policy votes_read on public.dinner_votes for select to authenticated using (exists(select 1 from public.dinners d where d.id=dinner_id and private.is_member(d.group_id)));
create policy votes_insert on public.dinner_votes for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.dinners d where d.id=dinner_id and private.is_member(d.group_id)));
create policy votes_update on public.dinner_votes for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()) and exists(select 1 from public.dinners d where d.id=dinner_id and private.is_member(d.group_id)));
create policy votes_delete on public.dinner_votes for delete to authenticated using (user_id=(select auth.uid()));
grant select,insert,update,delete on all tables in schema public to authenticated;
