import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'FutPeladaBr',description:'Organize jogos, escalações e confraternizações da sua turma.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
