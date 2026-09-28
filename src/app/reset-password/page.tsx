import { changePassword } from '../actions';
export default function ResetPassword(){return <main className="setup"><h1>Nova senha</h1><form action={changePassword} className="stack"><label>Senha<input name="password" type="password" required minLength={8} autoComplete="new-password"/></label><button>Alterar senha</button></form></main>}
