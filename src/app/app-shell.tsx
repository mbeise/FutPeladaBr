import Link from 'next/link';
import Image from 'next/image';
import { signOut } from './actions';

type Group = {id:string;name:string};
export default function AppShell({children, groups, group, active, email}:{children:React.ReactNode;groups:Group[];group:Group|null;active:'dashboard'|'games'|'stats'|'players';email?:string}) {
  const suffix = group ? `?group=${group.id}` : '';
  const links = [
    {id:'dashboard',label:'Dashboard',href:`/${suffix}`},
    {id:'games',label:'JOGOS',href:`/jogos${suffix}`},
    {id:'stats',label:'Estatísticas',href:`/estatisticas${suffix}`},
    {id:'players',label:'JOGADORES',href:`/jogadores${suffix}`},
  ];
  return <div className="app-layout"><aside className="sidebar"><Link href={`/${suffix}`} className="side-brand"><Image src="/futpeladabr-logo.png" alt="FutPeladaBr" width={1698} height={926}/></Link><p className="side-caption">SUA TURMA</p><strong className="side-group">{group?.name ?? 'Nova turma'}</strong><nav aria-label="Menu principal">{links.map(link=><Link key={link.id} href={link.href} aria-current={active===link.id?'page':undefined} className={active===link.id?'side-link active':'side-link'}>{link.label}</Link>)}</nav><div className="side-footer"><span>{email}</span><form action={signOut}><button className="ghost">Sair</button></form></div></aside><main className="main-content">{groups.length>1&&<nav className="group-switch" aria-label="Selecionar turma">{groups.map(g=><Link key={g.id} href={`/${active==='dashboard'?'':active==='games'?'jogos':active==='stats'?'estatisticas':'jogadores'}?group=${g.id}`} aria-current={g.id===group?.id?'page':undefined} className={g.id===group?.id?'button':'button secondary'}>{g.name}</Link>)}</nav>}{children}</main></div>;
}
