import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {Resend} from 'resend';
export function db(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key) throw new Error('Supabase server environment variables not configured');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function mail(){if(!process.env.RESEND_API_KEY)throw new Error('RESEND_API_KEY is not configured');return new Resend(process.env.RESEND_API_KEY)}
export async function adminFromRequest(request:Request){
 const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
 if(!token || !process.env.ADMIN_EMAIL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return null;
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(token);
 if(error || !data.user || !data.user.email || data.user.email.toLowerCase()!==process.env.ADMIN_EMAIL.toLowerCase())return null;
 return {email:data.user.email,id:data.user.id};
}
export const unauthorized=()=>Response.json({error:'Unauthorized'},{status:401});
export const cleanText=(s:unknown)=>String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
