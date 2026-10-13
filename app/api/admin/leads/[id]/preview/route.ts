import {adminFromRequest,db,unauthorized} from '@/lib/server';
import {makeQuotePdf} from '@/lib/pdf';
export const runtime='nodejs';
type Params={params:Promise<{id:string}>};
export async function GET(request:Request,{params}:Params){const user=await adminFromRequest(request);if(!user)return unauthorized();const {id}=await params;
 const {data:lead}=await db().from('leads').select('*').eq('id',id).single();if(!lead)return Response.json({error:'Lead not found'},{status:404});
 const bytes=await makeQuotePdf(lead,true);
 return new Response(Buffer.from(bytes),{headers:{'Content-Type':'application/pdf','Content-Disposition':`inline; filename="Quotation-${lead.quote_number}.pdf"`,'Cache-Control':'private, no-store'}});
}
