import {adminFromRequest,db,unauthorized} from '@/lib/server';
export const runtime='nodejs';
export async function GET(request:Request){
 const user=await adminFromRequest(request);if(!user)return unauthorized();
 const {data,error}=await db().from('leads').select('id,quote_number,created_at,updated_at,status,contact_name,contact_email,company_name,website_name,package,quoted_price,notification_status,approved_at').order('created_at',{ascending:false}).limit(300);
 if(error)return Response.json({error:'Could not retrieve leads'},{status:500});
 return Response.json({leads:data});
}
