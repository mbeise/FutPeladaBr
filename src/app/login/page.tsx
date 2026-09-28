import Link from 'next/link';
import Image from 'next/image';
import { sendReset, signIn, signUp } from '../actions';
export default async function Login({searchParams}:{searchParams:Promise<{notice?:string}>}){
 const {notice}=await searchParams;
 return <main className="setup"><Image className="form-logo" src="/futpeladabr-logo.png" alt="FutPeladaBr — gestão da pelada semanal" width={1698} height={926} priority/><h1>Entre na turma</h1>{notice&&<p role="status">{notice}</p>}
 <form action={signIn} className="stack"><label>E-mail<input name="email" type="email" required autoComplete="email"/></label><label>Senha<input name="password" type="password" required autoComplete="current-password"/></label><button>Entrar</button><button formAction={signUp} className="secondary">Criar conta</button></form>
 <details><summary>Esqueci minha senha</summary><form action={sendReset} className="stack"><label>E-mail<input name="email" type="email" required/></label><button>Enviar recuperação</button></form></details><p><Link href="/">Voltar</Link></p></main>;
}
