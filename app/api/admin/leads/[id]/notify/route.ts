import {adminFromRequest,db,unauthorized} from '@/lib/server';
import {notifyProvider} from '@/lib/email';
export const runtime='nodejs';
type Params={params:Promise<{id:string}>};
export async function POST(request:Request,{params}:Params){const user=await adminFromRequest(request);if(!user)return unauthorized();const {id}=await params;const client=db();
 const {data:lead}=await client.from('leads').select('*').eq('id',id).single();if(!lead)return Response.json({error:'Lead not found'},{status:404});
 try{await notifyProvider(lead);await client.from('leads').update({notification_status:'sent',notification_error:null}).eq('id',id);await client.from('lead_events').insert({lead_id:id,actor:user.email,action:'provider_notified'});return Response.json({ok:true});}
 catch(error){await client.from('leads').update({notification_status:'failed',notification_error:String(error).slice(0,500)}).eq('id',id);return Response.json({error:String(error)},{status:502});}
}
