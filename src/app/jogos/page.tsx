import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '../app-shell';
import ConfirmSubmit from '../confirm-submit';
import { addGame, removeGame, updateGame } from '../actions';
import { gameDate, gameInputDate, groupData } from '@/lib/group-data';

export default async function Games({searchParams}:{searchParams:Promise<{group?:string}>}) {
  const {user,groups,group,games,appearances} = await groupData((await searchParams).group);
  if (!user) redirect('/login');
  const admin = group?.owner_id === user.id;
  return <AppShell groups={groups} group={group} active="games" email={user.email}><div className="heading"><div><p className="eyebrow">AGENDA</p><h1>JOGOS</h1><p>Partidas, escalações e placares da turma.</p></div></div>
    {!group?<p>Crie uma turma no <Link href="/">dashboard</Link>.</p>:<section className="card full">{games.map(g=>{const assigned=appearances.filter(row=>row.game_id===g.id);return <div className="editable-row" key={g.id}><Link href={`/game/${g.id}`} className="event"><strong>{gameDate(g.starts_at)}</strong><span>{g.venue} · {assigned.length} escalado(s) · {assigned.length?`${assigned.filter(p=>p.team===1).reduce((n,p)=>n+p.goals,0)} × ${assigned.filter(p=>p.team===2).reduce((n,p)=>n+p.goals,0)}`:'aguardando escalação'} →</span></Link>{admin&&<details><summary>Editar jogo</summary><form action={updateGame} className="stack"><input type="hidden" name="group_id" value={group.id}/><input type="hidden" name="id" value={g.id}/><label>Data e hora<input name="starts_at" type="datetime-local" defaultValue={gameInputDate(g.starts_at)} required/></label><label>Local<input name="venue" defaultValue={g.venue} required minLength={2} maxLength={160}/></label><button>Salvar alterações</button></form></details>}{admin&&<form action={removeGame}><input type="hidden" name="group_id" value={group.id}/><input type="hidden" name="id" value={g.id}/><ConfirmSubmit className="textdanger" message="Excluir este jogo e sua escalação?">Excluir jogo</ConfirmSubmit></form>}</div>})}{!games.length&&<p className="muted">Ainda não há jogos marcados.</p>}{admin&&<details><summary>Marcar jogo</summary><form action={addGame} className="stack"><input type="hidden" name="group_id" value={group.id}/><label>Data e hora<input name="starts_at" type="datetime-local" required/></label><label>Local<input name="venue" required minLength={2} maxLength={160}/></label><button>Salvar jogo</button></form></details>}</section>}
  </AppShell>;
}
