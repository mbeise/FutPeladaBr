import { changePassword } from '../actions';
import ThemeToggle from '../theme-toggle';
export default function ResetPassword(){return <main className="setup login-card"><div className="login-theme"><ThemeToggle compact/></div><h1>Nova senha</h1><form action={changePassword} className="stack"><label>Senha<input name="password" type="password" required minLength={8} autoComplete="new-password"/></label><button>Alterar senha</button></form></main>}
