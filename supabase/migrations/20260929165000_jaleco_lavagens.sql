-- Cada jogador ativo participa de uma lavagem por rodada.
create table if not exists public.jersey_washes (
  group_id uuid not null references public.groups(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  round_no integer not null check (round_no > 0),
  washed_at timestamptz not null default now(),
  primary key (group_id, round_no, player_id)
);
create index if not exists jersey_washes_group_round on public.jersey_washes(group_id, round_no desc);
alter table public.jersey_washes enable row level security;
create policy jersey_washes_read on public.jersey_washes for select to authenticated using (private.is_member(group_id));
create policy jersey_washes_insert on public.jersey_washes for insert to authenticated with check (
  private.is_owner(group_id) and exists (
    select 1 from public.players p where p.id = player_id and p.group_id = group_id and p.active
  )
);
create policy jersey_washes_delete on public.jersey_washes for delete to authenticated using (private.is_owner(group_id));
grant select, insert, delete on public.jersey_washes to authenticated;
