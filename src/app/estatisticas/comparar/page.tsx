import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '../../app-shell';
import { groupData, playerStats } from '@/lib/group-data';

export default async function Compare({searchParams}:{searchParams:Promise<{group?:string;a?:string;b?:string}>}) {
  const query = await searchParams;
  const {user,groups,group,players,appearances} = await groupData(query.group);
  if (!user) redirect('/login');
  const stats = new Map(playerStats(players,appearances).map(p=>[p.id,p]));
  const first = players.find(p=>p.id===query.a) ?? players[0];
  const second = players.find(p=>p.id===query.b && p.id!==first?.id) ?? players.find(p=>p.id!==first?.id);
  const columns = [first,second];
  const rows = [
    ['Posições',(p:typeof first)=>p?.positions.join(', ')??'—'],
    ['Habilidade',(p:typeof first)=>p?.skill??'—'],
    ['Velocidade',(p:typeof first)=>p?.speed??'—'],
    ['Visão de jogo',(p:typeof first)=>p?.vision??'—'],
    ['Passe',(p:typeof first)=>p?.passing??'—'],
    ['Escalações',(p:typeof first)=>p?stats.get(p.id)?.games??0:'—'],
    ['Gols',(p:typeof first)=>p?stats.get(p.id)?.goals??0:'—'],
  ] as const;
  return <AppShell groups={groups} group={group} active="stats" email={user.email}><div className="heading"><div><p className="eyebrow">ESTATÍSTICAS</p><h1>Comparar jogadores</h1><p>Notas cadastradas e números das escalações da turma.</p></div><Link href={`/estatisticas?group=${group?.id??''}`}>Voltar</Link></div>
    {!group?<p>Crie uma turma no <Link href="/">dashboard</Link>.</p>:<section className="card full">{players.length<2?<p className="muted">Cadastre pelo menos dois jogadores para comparar.</p>:<><form method="get" action="/estatisticas/comparar" className="comparison-select"><input type="hidden" name="group" value={group.id}/><label>Jogador 1<select name="a" defaultValue={first.id}>{players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Jogador 2<select name="b" defaultValue={second?.id}>{players.filter(p=>p.id!==first.id).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button>Comparar</button></form><div className="table-scroll"><table className="comparison-table"><thead><tr><th>Indicador</th>{columns.map(p=><th key={p.id}>{p.name}</th>)}</tr></thead><tbody>{rows.map(([label,get])=><tr key={label}><th scope="row">{label}</th>{columns.map(p=><td key={p.id}>{get(p)}</td>)}</tr>)}</tbody></table></div><p className="muted">Escalações contam jogos em que o jogador foi selecionado. Gols dependem do registro feito pelo administrador.</p></>}</section>}
  </AppShell>;
}
