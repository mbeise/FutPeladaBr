import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '../app-shell';
import { groupData, playerStats } from '@/lib/group-data';

export default async function Statistics({searchParams}:{searchParams:Promise<{group?:string}>}) {
  const {user,groups,group,players,appearances} = await groupData((await searchParams).group);
  if (!user) redirect('/login');
  const ranking = playerStats(players,appearances);
  return <AppShell groups={groups} group={group} active="stats" email={user.email}><div className="heading"><div><p className="eyebrow">DESEMPENHO</p><h1>Estatísticas</h1><p>Gols e participações nas escalações registradas.</p></div></div>
    {!group?<p>Crie uma turma no <Link href="/">dashboard</Link>.</p>:<div className="grid"><section className="card"><h2>Artilharia</h2>{ranking.map((p,i)=><div className="stat-row" key={p.id}><span>{i+1}. {p.name}</span><strong>{p.goals} gol(s)</strong></div>)}{!ranking.length&&<p className="muted">Cadastre jogadores para iniciar o ranking.</p>}</section><section className="card"><h2>Participação</h2>{[...ranking].sort((a,b)=>b.games-a.games||a.name.localeCompare(b.name,'pt-BR')).map(p=><div className="stat-row" key={p.id}><span>{p.name}</span><strong>{p.games} escalação(ões)</strong></div>)}{!ranking.length&&<p className="muted">Ainda não há jogadores.</p>}</section><section className="card full"><h2>Comparar jogadores</h2><p>Veja lado a lado notas técnicas, gols e participações.</p><Link className="button" href={`/estatisticas/comparar?group=${group.id}`}>Abrir comparação</Link></section></div>}
  </AppShell>;
}
