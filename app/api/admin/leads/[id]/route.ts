import {adminFromRequest,db,unauthorized} from '@/lib/server';
import {z} from 'zod';
export const runtime='nodejs';
type Params={params:Promise<{id:string}>};
export async function GET(request:Request,{params}:Params){const user=await adminFromRequest(request);if(!user)return unauthorized();const {id}=await params;
 const client=db();const {data,error}=await client.from('leads').select('*').eq('id',id).single();if(error||!data)return Response.json({error:'Not found'},{status:404});
 const {data:events}=await client.from('lead_events').select('id,created_at,actor,action,detail').eq('lead_id',id).order('created_at',{ascending:false});
 return Response.json({lead:data,events:events||[]});
}
const schema=z.object({adminNotes:z.string().max(4000).default(''),quotedPrice:z.number().int().min(500).max(100000)});
export async function PATCH(request:Request,{params}:Params){const user=await adminFromRequest(request);if(!user)return unauthorized();const {id}=await params;
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return Response.json({error:'Invalid details'},{status:400});
 const client=db();const {data,error}=await client.from('leads').update({admin_notes:parsed.data.adminNotes,quoted_price:parsed.data.quotedPrice,updated_at:new Date().toISOString()}).eq('id',id).eq('status','pending_review').select('*').maybeSingle();
 if(error)return Response.json({error:'Could not save changes'},{status:500});if(!data)return Response.json({error:'Only pending leads can be edited'},{status:409});
 await client.from('lead_events').insert({lead_id:id,actor:user.email,action:'edited',detail:`Quoted price updated to ${parsed.data.quotedPrice}`});
 return Response.json({lead:data});
}
