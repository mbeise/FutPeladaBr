'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function PasswordField() {
  const [visible,setVisible] = useState(false);
  return <label>Senha<span className="password-wrap"><input name="password" type={visible?'text':'password'} required autoComplete="current-password"/><button type="button" className="password-eye" onClick={()=>setVisible(!visible)} aria-label={visible?'Ocultar senha':'Mostrar senha'} aria-pressed={visible}>{visible?<EyeOff size={20} aria-hidden="true"/>:<Eye size={20} aria-hidden="true"/>}</button></span></label>;
}
