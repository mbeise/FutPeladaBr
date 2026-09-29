import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'FutPeladaBr',description:'Organize jogos, escalações e confraternizações da sua turma.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{document.documentElement.dataset.theme=localStorage.getItem('futpeladabr-theme')==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}"}}/></head><body>{children}</body></html>}
