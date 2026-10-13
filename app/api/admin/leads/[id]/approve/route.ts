import {adminFromRequest,db,unauthorized} from '@/lib/server';
import {sendOfficial} from '@/lib/email';
export const runtime='nodejs';
type Params={params:Promise<{id:string}>};
export async function POST(request:Request,{params}:Params){
 const user=await adminFromRequest(request);if(!user)return unauthorized();const {id}=await params;const client=db();
 // Atomic reservation avoids simultaneous double-send from repeated clicks.
 const {data:lead,error}=await client.from('leads').update({status:'sending',updated_at:new Date().toISOString(),approved_by:user.email}).eq('id',id).in('status',['pending_review','delivery_failed']).select('*').maybeSingle();
 if(error)return Response.json({error:'Could not reserve lead'},{status:500});
 if(!lead)return Response.json({error:'Lead already approved, rejected or being sent. Reload the dashboard.'},{status:409});
 await client.from('lead_events').insert({lead_id:id,actor:user.email,action:'approved',detail:'Sending official quotation PDF to client'});
 try{
  const emailId=await sendOfficial(lead);
  await client.from('leads').update({status:'approved_sent',client_email_id:emailId,client_email_error:null,approved_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',id);
  await client.from('lead_events').insert({lead_id:id,actor:'system',action:'official_quote_sent',detail:emailId||'Email accepted by provider'});
  return Response.json({ok:true,emailId});
 }catch(error){
  await client.from('leads').update({status:'delivery_failed',client_email_error:String(error).slice(0,500),updated_at:new Date().toISOString()}).eq('id',id);
  await client.from('lead_events').insert({lead_id:id,actor:'system',action:'official_quote_failed',detail:String(error).slice(0,500)});
  return Response.json({error:'Sending failed. Please verify email configuration and retry carefully. A provider timeout can leave delivery uncertain.'},{status:502});
 }
}
