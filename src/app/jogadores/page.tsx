import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '../app-shell';
import ConfirmSubmit from '../confirm-submit';
import RatingArrows from '../rating-arrows';
import { addPlayer, removePlayer, updatePlayer } from '../actions';
import { groupData, playerStats } from '@/lib/group-data';

const positions = ['Goleiro','Zagueiro','Lateral','Meio-campo','Atacante'];
const ratings = [['skill','Habilidade'],['speed','Velocidade'],['vision','Visão de jogo'],['passing','Passe']] as const;

export default async function Players({searchParams}:{searchParams:Promise<{group?:string}>}) {
  const {user,groups,group,players,appearances} = await groupData((await searchParams).group);
  if (!user) redirect('/login');
  const admin = group?.owner_id === user.id;
  const stats = new Map(playerStats(players,appearances).map(p=>[p.id,p]));
  return <AppShell groups={groups} group={group} active="players" email={user.email}><div className="heading"><div><p className="eyebrow">ELENCO</p><h1>JOGADORES</h1><p>Dados técnicos e participação nas escalações.</p></div>{admin&&<details className="add-player"><summary>+ Adicionar jogador</summary><form action={addPlayer} className="formgrid"><input type="hidden" name="group_id" value={group!.id}/><label>Nome<input name="name" required minLength={2} maxLength={80}/></label><fieldset><legend>Posições</legend>{positions.map(pos=><label className="check" key={pos}><input type="checkbox" name="positions" value={pos}/>{pos}</label>)}</fieldset>{ratings.map(([key,label])=><RatingArrows key={key} name={key} label={label}/>)}<button>Salvar jogador</button></form></details>}</div>
    {!group?<p>Crie uma turma no <Link href="/">dashboard</Link>.</p>:<section className="card full">{players.map(p=><div className="editable-row" key={p.id}><div className="rosterrow"><div className="avatar">{p.name.slice(0,1).toUpperCase()}</div><div className="grow"><strong>{p.name}</strong><small>{p.positions.join(' · ')}</small><small>{stats.get(p.id)?.games??0} escalação(ões) · {stats.get(p.id)?.goals??0} gol(s)</small></div><div className="rating">{p.skill}/5 <small>técnica</small></div>{admin&&<form action={removePlayer}><input type="hidden" name="group_id" value={group.id}/><input type="hidden" name="id" value={p.id}/><ConfirmSubmit className="textdanger" message={`Excluir ${p.name} e seus registros nos jogos?`}>Excluir</ConfirmSubmit></form>}</div>{admin&&<details><summary>Editar {p.name}</summary><form action={updatePlayer} className="formgrid"><input type="hidden" name="group_id" value={group.id}/><input type="hidden" name="id" value={p.id}/><label>Nome<input name="name" required minLength={2} maxLength={80} defaultValue={p.name}/></label><fieldset><legend>Posições</legend>{positions.map(pos=><label className="check" key={pos}><input type="checkbox" name="positions" value={pos} defaultChecked={p.positions.includes(pos)}/>{pos}</label>)}</fieldset>{ratings.map(([key,label])=><RatingArrows key={key} name={key} label={label} value={p[key]}/>)}<button>Salvar alterações</button></form></details>}</div>)}{!players.length&&<p className="muted">Nenhum jogador cadastrado.</p>}</section>}
  </AppShell>;
}
