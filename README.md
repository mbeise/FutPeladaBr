# FutPeladaBr — base funcional

Aplicação Next.js 16, React 19, TypeScript e Supabase para grupos de futebol amador. Esta entrega contém autenticação por e-mail, criação de grupo, jogadores com posições e notas, jogos, divisão de equipes e votação com rateio de confraternização.

## Situação

Esta é uma primeira implementação, ainda não publicada. O repositório GitHub, o projeto Supabase, as credenciais de produção, o domínio e a conta de pagamentos não foram informados. Sem eles não foi possível aplicar o esquema, validar fluxos de produção ou publicar na Vercel.

Ainda faltam: convites de visitantes, gestão de vários grupos na interface, edição e exclusão com confirmação, artilharia, registro detalhado de despesas, logo com Storage, planos Free/Premium, Mercado Pago, painel administrativo, exclusão de conta, testes de integração e reconciliação. Não habilite cobranças antes de concluir e testar o fluxo de pagamentos.

## Instalação

1. Crie um projeto Supabase e execute `supabase/schema.sql` no SQL Editor.
2. Copie `.env.example` para `.env.local` e preencha as três variáveis. Nunca inclua segredos em `NEXT_PUBLIC_*`.
3. Configure no Supabase Auth o Site URL e as URLs de redirecionamento para `https://SEU-DOMINIO/auth/callback` e, em desenvolvimento, `http://localhost:3000/auth/callback`.
4. Execute `npm ci` e `npm run dev`.
5. Após criar o repositório, conecte-o à Vercel e configure as mesmas variáveis nos ambientes apropriados. Aplique o SQL antes de usar o aplicativo.

## Estrutura

- `src/app/page.tsx`: painel, jogadores, jogos e confraternizações.
- `src/app/game/[id]/page.tsx`: cartaz e seleção dos jogadores.
- `src/app/actions.ts`: mutações e autorização do administrador.
- `src/lib/teams.ts`: distribuição determinística por posições e notas.
- `src/lib/supabase.ts`: sessão Supabase no servidor.
- `supabase/schema.sql`: tabelas, índices e políticas RLS.

## Segurança e limites

Todas as tabelas expostas têm RLS. Membros leem os dados do grupo; o proprietário altera cadastros; cada participante altera o próprio voto. A autorização das operações é verificada no banco e nas ações do servidor. Nenhuma chave administrativa é usada no cliente. O rateio divide o custo total em centavos pelo número de votos positivos, arredondando para cima na exibição; a soma pode superar o total em alguns centavos. Uma cobrança deve distribuir os centavos restantes explicitamente.

## Validação desta entrega

`npx tsc --noEmit` e `npm run build` foram executados com sucesso. Os fluxos de autenticação, RLS, confirmação de e-mail e escrita não foram testados contra um Supabase real. O algoritmo de escalação é uma heurística, não garante equilíbrio ótimo ou posições exatas. Horários de `datetime-local` são interpretados no fuso do navegador; a exibição usa São Paulo.

## Próximas etapas

Vincular Supabase, implementar e testar as funcionalidades pendentes, criar repositório GitHub, configurar Vercel e DNS, revisar o domínio e validar no navegador o fluxo completo com duas contas diferentes. Só então ativar planos e pagamentos reais.
