import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, CalendarDays, ChevronRight, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { signOut } from './actions';
import ThemeToggle from './theme-toggle';

type Group = {id:string;name:string};
export default function AppShell({children, groups, group, active, email}:{children:React.ReactNode;groups:Group[];group:Group|null;active:'dashboard'|'games'|'stats'|'players';email?:string}) {
  const suffix = group ? `?group=${group.id}` : '';
  const links = [
    {id:'dashboard',label:'Dashboard',href:`/${suffix}`,icon:LayoutDashboard},
    {id:'games',label:'Jogos',href:`/jogos${suffix}`,icon:CalendarDays},
    {id:'stats',label:'Estatísticas',href:`/estatisticas${suffix}`,icon:BarChart3},
    {id:'players',label:'Jogadores',href:`/jogadores${suffix}`,icon:Users},
  ];
  return <div className="app-layout"><aside className="sidebar"><Link href={`/${suffix}`} className="side-brand"><Image src="/futpeladabr-logo.png" alt="FutPeladaBr" width={1698} height={926}/></Link><div className="side-team"><span className="side-caption">Minha turma</span><strong className="side-group">{group?.name ?? 'Nova turma'}</strong></div><nav aria-label="Menu principal">{links.map(link=><Link key={link.id} href={link.href} aria-current={active===link.id?'page':undefined} className={active===link.id?'side-link active':'side-link'}><link.icon size={19} strokeWidth={2} aria-hidden="true"/><span>{link.label}</span><ChevronRight className="side-arrow" size={16} aria-hidden="true"/></Link>)}</nav><div className="side-footer"><ThemeToggle/><span className="account-email">{email}</span><form action={signOut}><button className="side-logout"><LogOut size={17} aria-hidden="true"/> Sair</button></form></div></aside><main className="main-content">{groups.length>1&&<nav className="group-switch" aria-label="Selecionar turma">{groups.map(g=><Link key={g.id} href={`/${active==='dashboard'?'':active==='games'?'jogos':active==='stats'?'estatisticas':'jogadores'}?group=${g.id}`} aria-current={g.id===group?.id?'page':undefined} className={g.id===group?.id?'button':'button secondary'}>{g.name}</Link>)}</nav>}{children}</main></div>;
}
