'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { currentUser, db } from '@/lib/supabase';
import { balanceTeams, type Player } from '@/lib/teams';

function value(form: FormData, key: string) { return String(form.get(key) ?? '').trim(); }
function localDate(form:FormData,key:string) { return new Date(`${value(form,key)}:00-03:00`); }
function fail(error: { message: string } | null) { if (error) throw new Error(error.message); }
async function siteUrl() {
  const host=(await headers()).get('host');
  const trustedHosts=[
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    'futpeladabr.com.br',
    'www.futpeladabr.com.br',
  ];
  if(host && trustedHosts.includes(host)) return `https://${host}`;
  const configured=process.env.NEXT_PUBLIC_SITE_URL;
  const vercelDomain=process.env.VERCEL_ENV==='preview'
    ? process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const origin=configured || (vercelDomain ? `https://${vercelDomain}` : undefined);
  if (!origin) throw new Error('Configure NEXT_PUBLIC_SITE_URL para os e-mails de autenticação.');
  return origin.replace(/\/$/, '');
}
async function owner(groupId: string) {
  const { client, user } = await currentUser();
  const { data } = await client.from('groups').select('owner_id').eq('id', groupId).single();
  if (data?.owner_id !== user.id) throw new Error('Somente o administrador pode alterar estes dados.');
  return { client, user };
}

export async function signIn(form: FormData) {
  const client = await db();
  const { error } = await client.auth.signInWithPassword({ email:value(form,'email'), password:value(form,'password') });
  if (error) {
    const notice = error.code === 'email_not_confirmed'
      ? 'Confirme seu e-mail pelo link enviado antes de entrar.'
      : error.code === 'invalid_credentials'
        ? 'E-mail ou senha incorretos.'
        : 'Não foi possível entrar agora. Tente novamente.';
    redirect(`/login?notice=${encodeURIComponent(notice)}`);
  }
  redirect('/');
}
export async function signUp(form: FormData) {
  const client = await db();
  const origin = await siteUrl();
  const { error } = await client.auth.signUp({ email:value(form,'email'), password:value(form,'password'), options:{emailRedirectTo:`${origin}/auth/callback`} });
  if (error) redirect(`/login?notice=${encodeURIComponent('Não foi possível criar a conta. Confira os dados e tente novamente.')}`);
  redirect('/login?notice=Confirme%20seu%20e-mail%20antes%20de%20entrar');
}
export async function signOut() { const client=await db(); fail((await client.auth.signOut()).error); redirect('/login'); }
export async function sendReset(form: FormData) {
  const client=await db(); const origin=await siteUrl();
  const { error } = await client.auth.resetPasswordForEmail(value(form,'email'), {redirectTo:`${origin}/auth/callback?next=/reset-password`});
  if (error) redirect(`/login?notice=${encodeURIComponent('Não foi possível enviar a recuperação agora. Tente novamente.')}`);
  redirect('/login?notice=Se%20a%20conta%20existir%2C%20enviaremos%20um%20e-mail');
}
export async function changePassword(form: FormData) {
  const client=await db(); fail((await client.auth.updateUser({password:value(form,'password')})).error); redirect('/');
}
export async function createGroup(form:FormData) {
  const { client,user }=await currentUser(); const name=value(form,'name');
  if(name.length<2 || name.length>80) throw new Error('Informe um nome entre 2 e 80 caracteres.');
  fail((await client.from('groups').insert({name,owner_id:user.id})).error); revalidatePath('/');
}
export async function addPlayer(form:FormData) {
  const group_id=value(form,'group_id'); const {client}=await owner(group_id);
  const positions=form.getAll('positions').map(String);
  const allowed=['Goleiro','Zagueiro','Lateral','Meio-campo','Atacante'];
  if(!positions.length || positions.some(p=>!allowed.includes(p))) throw new Error('Selecione uma posição válida.');
  const ratings=Object.fromEntries(['skill','speed','vision','passing'].map(k=>[k,Number(value(form,k))]));
  if(Object.values(ratings).some(n=>!Number.isInteger(n)||n<1||n>5)) throw new Error('As notas devem ser de 1 a 5.');
  fail((await client.from('players').insert({group_id,name:value(form,'name'),positions,...ratings})).error); revalidatePath('/');
}
export async function updatePlayer(form:FormData) {
  const groupId=value(form,'group_id'); const {client}=await owner(groupId);
  const name=value(form,'name'); const positions=form.getAll('positions').map(String);
  const allowed=['Goleiro','Zagueiro','Lateral','Meio-campo','Atacante'];
  const ratings=Object.fromEntries(['skill','speed','vision','passing'].map(k=>[k,Number(value(form,k))]));
  if(name.length<2||name.length>80||!positions.length||positions.some(p=>!allowed.includes(p))||Object.values(ratings).some(n=>!Number.isInteger(n)||n<1||n>5)) throw new Error('Confira o nome, as posições e as notas de 1 a 5.');
  fail((await client.from('players').update({name,positions,...ratings}).eq('id',value(form,'id')).eq('group_id',groupId)).error);
  revalidatePath('/');
}
export async function removePlayer(form:FormData) {
  const groupId=value(form,'group_id'); const {client}=await owner(groupId);
  fail((await client.from('players').delete().eq('id',value(form,'id')).eq('group_id',groupId)).error); revalidatePath('/');
}
export async function addGame(form:FormData) {
  const group_id=value(form,'group_id'); const {client}=await owner(group_id);
  const date=localDate(form,'starts_at');
  if(Number.isNaN(date.getTime())) throw new Error('Data inválida.');
  fail((await client.from('games').insert({group_id,starts_at:date.toISOString(),venue:value(form,'venue')})).error); revalidatePath('/');
}
export async function updateGame(form:FormData) {
  const groupId=value(form,'group_id'); const {client}=await owner(groupId);
  const date=localDate(form,'starts_at'); const venue=value(form,'venue');
  if(Number.isNaN(date.getTime())||venue.length<2||venue.length>160) throw new Error('Confira a data e o local do jogo.');
  fail((await client.from('games').update({starts_at:date.toISOString(),venue}).eq('id',value(form,'id')).eq('group_id',groupId)).error);
  revalidatePath('/');
}
export async function removeGame(form:FormData) {
  const groupId=value(form,'group_id'); const {client}=await owner(groupId);
  fail((await client.from('games').delete().eq('id',value(form,'id')).eq('group_id',groupId)).error);
  revalidatePath('/');
}
export async function setGoals(form:FormData) {
  const groupId=value(form,'group_id'); const {client}=await owner(groupId);
  const gameId=value(form,'game_id'); const playerId=value(form,'player_id'); const goals=Number(value(form,'goals'));
  if(!Number.isInteger(goals)||goals<0||goals>99) throw new Error('Informe um número de gols entre 0 e 99.');
  const {data:game}=await client.from('games').select('id').eq('id',gameId).eq('group_id',groupId).single();
  if(!game) throw new Error('Jogo não encontrado nesta turma.');
  fail((await client.from('game_players').update({goals}).eq('game_id',gameId).eq('player_id',playerId)).error);
  revalidatePath(`/game/${gameId}`); revalidatePath('/');
}
export async function assignTeams(form:FormData) {
  const groupId=value(form,'group_id'); const gameId=value(form,'game_id'); const {client}=await owner(groupId);
  const {data:game}=await client.from('games').select('id').eq('id',gameId).eq('group_id',groupId).single();
  if(!game) throw new Error('Jogo não encontrado.');
  const ids=form.getAll('player_id').map(String);
  const {data,error}=await client.from('players').select('id,name,positions,skill,speed,vision,passing').eq('group_id',groupId).eq('active',true).in('id',ids);
  fail(error); if(!data || data.length!==new Set(ids).size) throw new Error('Jogadores inválidos.');
  const teams=balanceTeams(data as Player[]);
  const {data:previous}=await client.from('game_players').select('player_id,goals').eq('game_id',gameId);
  const goalsByPlayer=new Map((previous??[]).map(p=>[p.player_id,p.goals]));
  fail((await client.from('game_players').delete().eq('game_id',gameId)).error);
  fail((await client.from('game_players').insert(teams.flatMap((team,i)=>team.map(p=>({game_id:gameId,player_id:p.id,team:i+1,goals:goalsByPlayer.get(p.id)??0}))))).error);
  revalidatePath(`/game/${gameId}`); redirect(`/game/${gameId}`);
}
export async function addDinner(form:FormData) {
  const group_id=value(form,'group_id'); const {client}=await owner(group_id);
  const date=localDate(form,'event_at'); if(Number.isNaN(date.getTime())) throw new Error('Data inválida.');
  fail((await client.from('dinners').insert({group_id,title:value(form,'title'),event_at:date.toISOString()})).error); revalidatePath('/');
}
export async function setDinnerCost(form:FormData) {
  const groupId=value(form,'group_id'); const {client}=await owner(groupId);
  const cents=Math.round(Number(value(form,'amount').replace(',','.'))*100);
  if(!Number.isSafeInteger(cents)||cents<0) throw new Error('Valor inválido.');
  fail((await client.from('dinners').update({total_cents:cents}).eq('id',value(form,'dinner_id')).eq('group_id',groupId)).error); revalidatePath('/');
}
export async function voteDinner(form:FormData) {
  const {client,user}=await currentUser(); const id=value(form,'dinner_id');
  fail((await client.from('dinner_votes').upsert({dinner_id:id,user_id:user.id,attending:value(form,'attending')==='true',updated_at:new Date().toISOString()})).error); revalidatePath('/');
}
