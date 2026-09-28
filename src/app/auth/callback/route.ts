import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
export async function GET(request:Request){
 const url=new URL(request.url);const code=url.searchParams.get('code');
 if(!code)return NextResponse.redirect(new URL('/login?notice=Link%20inv%C3%A1lido',url.origin));
 const client=await db();const {error}=await client.auth.exchangeCodeForSession(code);
 if(error)return NextResponse.redirect(new URL('/login?notice=Link%20expirado%20ou%20inv%C3%A1lido',url.origin));
 const next=url.searchParams.get('next');
 return NextResponse.redirect(new URL(next?.startsWith('/')&&!next.startsWith('//')?next:'/',url.origin));
}
