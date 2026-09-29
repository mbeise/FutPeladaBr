import { db } from '@/lib/supabase';

export async function groupData(requested?: string) {
  const client = await db();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { user: null, groups: [], group: null, players: [], games: [], appearances: [], client };
  const { data: groups, error } = await client.from('groups').select('id,name,owner_id').order('created_at');
  if (error) throw new Error(error.message);
  const group = groups?.find(g => g.id === requested) ?? groups?.[0] ?? null;
  if (!group) return { user, groups: groups ?? [], group, players: [], games: [], appearances: [], client };
  const [pr, gr] = await Promise.all([
    client.from('players').select('*').eq('group_id', group.id).order('name'),
    client.from('games').select('*').eq('group_id', group.id).order('starts_at', { ascending: false }),
  ]);
  if (pr.error) throw new Error(pr.error.message);
  if (gr.error) throw new Error(gr.error.message);
  const games = gr.data ?? [];
  const ids = games.map(g => g.id);
  const gp = ids.length ? await client.from('game_players').select('game_id,player_id,team,goals').in('game_id', ids) : null;
  if (gp?.error) throw new Error(gp.error.message);
  return { user, groups: groups ?? [], group, players: pr.data ?? [], games, appearances: gp?.data ?? [], client };
}

export function playerStats(players: {id:string;name:string}[], appearances: {player_id:string;goals:number}[]) {
  return players.map(player => ({
    ...player,
    games: appearances.filter(row => row.player_id === player.id).length,
    goals: appearances.filter(row => row.player_id === player.id).reduce((n, row) => n + row.goals, 0),
  })).sort((a, b) => b.goals - a.goals || b.games - a.games || a.name.localeCompare(b.name, 'pt-BR'));
}

export const gameDate = (value:string) => new Date(value).toLocaleString('pt-BR', {dateStyle:'medium',timeStyle:'short',timeZone:'America/Sao_Paulo'});
export const gameInputDate = (value:string) => new Intl.DateTimeFormat('sv-SE', {timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value)).replace(' ', 'T');
