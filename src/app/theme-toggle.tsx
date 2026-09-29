'use client';

import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({compact=false}:{compact?:boolean}) {
  function toggle() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('futpeladabr-theme', next);
  }
  return <button type="button" className={compact?'theme-toggle compact':'theme-toggle'} onClick={toggle} aria-label="Alternar tema claro ou escuro" title="Alternar tema claro ou escuro">
    <Moon className="light-only" size={18} aria-hidden="true"/><Sun className="dark-only" size={18} aria-hidden="true"/>
    {!compact&&<><span className="light-only">Tema escuro</span><span className="dark-only">Tema claro</span></>}
  </button>;
}
