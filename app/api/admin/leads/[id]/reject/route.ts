import {adminFromRequest,db,unauthorized} from '@/lib/server';
export const runtime='nodejs';
type Params={params:Promise<{id:string}>};
export async function POST(request:Request,{params}:Params){const user=await adminFromRequest(request);if(!user)return unauthorized();const {id}=await params;const client=db();
 const {data,error}=await client.from('leads').update({status:'rejected',rejected_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',id).eq('status','pending_review').select('id').maybeSingle();
 if(error)return Response.json({error:'Failed to reject'},{status:500});if(!data)return Response.json({error:'Only pending leads can be rejected'},{status:409});
 await client.from('lead_events').insert({lead_id:id,actor:user.email,action:'rejected'});
 return Response.json({ok:true});
}
