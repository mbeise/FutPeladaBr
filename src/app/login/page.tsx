import Link from 'next/link';
import { sendReset, signIn, signUp } from '../actions';
export default async function Login({searchParams}:{searchParams:Promise<{notice?:string}>}){
 const {notice}=await searchParams;
 return <main className="setup"><div className="brand"><span className="ball">⚽</span><strong>FutPelada<span>Br</span></strong></div><h1>Entre na turma</h1>{notice&&<p role="status">{notice}</p>}
 <form action={signIn} className="stack"><label>E-mail<input name="email" type="email" required autoComplete="email"/></label><label>Senha<input name="password" type="password" required autoComplete="current-password"/></label><button>Entrar</button><button formAction={signUp} className="secondary">Criar conta</button></form>
 <details><summary>Esqueci minha senha</summary><form action={sendReset} className="stack"><label>E-mail<input name="email" type="email" required/></label><button>Enviar recuperação</button></form></details><p><Link href="/">Voltar</Link></p></main>;
}
