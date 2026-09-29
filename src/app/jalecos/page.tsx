import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2, CircleDashed, Shirt } from 'lucide-react';
import AppShell from '../app-shell';
import { markJerseyWashed, undoJerseyWash } from '../actions';
import { groupData } from '@/lib/group-data';
import { washingRound, type Wash } from '@/lib/washing';

export default async function Washing({searchParams}:{searchParams:Promise<{group?:string}>}) {
  const {user,groups,group,players,client}=await groupData((await searchParams).group);
  if(!user) redirect('/login');
  const admin=group?.owner_id===user.id;
  const {data:washes,error}=group ? await client.from('jersey_washes').select('player_id,round_no,washed_at').eq('group_id',group.id).order('round_no',{ascending:false}) : {data:[],error:null};
  if(error) throw new Error(error.message);
  const state=washingRound(players,washes as Wash[]??[]);
  const pending=state.active.filter(p=>!state.washed.has(p.id));
  return <AppShell groups={groups} group={group} active="washing" email={user.email}>
    <div className="heading"><div><p className="eyebrow">REVEZAMENTO</p><h1>Lavagem dos jalecos</h1><p>Uma vez por jogador em cada rodada. A próxima começa quando todos tiverem lavado.</p></div></div>
    {!group?<p>Crie uma turma no <Link href="/">dashboard</Link>.</p>:<>
      <div className="washing-summary"><div><Shirt size={27} aria-hidden="true"/><span>RODADA ATUAL</span><strong>{state.round}ª rodada</strong><small>{state.active.length-state.washed.size} de {state.active.length} ainda precisam lavar</small></div><div><CheckCircle2 size={27} aria-hidden="true"/><span>PROGRESSO</span><strong>{state.washed.size}/{state.active.length}</strong><small>{state.completedRounds} rodada(s) concluída(s)</small></div></div>
      <section className="card washing-card"><div className="washing-card-head"><div><p className="eyebrow">LISTA DA TURMA</p><h2>Quem falta nesta rodada</h2></div><span className="washing-count">{pending.length} pendente(s)</span></div>
        {!state.active.length&&<p className="muted">Cadastre jogadores ativos para iniciar o revezamento.</p>}
        {state.active.map(player=>{const p=players.find(item=>item.id===player.id)!;const done=state.washed.has(p.id);return <div className="washing-row" key={p.id}><div className={`washing-indicator ${done?'done':''}`}>{done?<CheckCircle2 size={22}/>:<CircleDashed size={22}/>}</div><div className="grow"><strong>{p.name}</strong><small>{done?'Lavagem registrada nesta rodada':'Ainda não lavou nesta rodada'}</small></div><span className={`washing-status ${done?'done':''}`}>{done?'Lavou':'Pendente'}</span>{admin&&<form action={done?undoJerseyWash:markJerseyWashed}><input type="hidden" name="group_id" value={group.id}/><input type="hidden" name="player_id" value={p.id}/><input type="hidden" name="round_no" value={state.round}/><button className={done?'ghost':'secondary'}>{done?'Desfazer':'Marcar lavado'}</button></form>}</div>})}
      </section>
      {state.completedRounds>0&&<p className="washing-footnote">{state.completedRounds} rodada(s) concluída(s). O histórico de cada lavagem permanece registrado.</p>}
    </>}
  </AppShell>;
}
