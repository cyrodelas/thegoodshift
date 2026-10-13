import {NextRequest} from 'next/server';
import {createHash,randomBytes} from 'crypto';
import {leadSchema} from '@/lib/validation';
import {PACKAGES} from '@/lib/catalog';
import {db} from '@/lib/server';
import {notifyProvider} from '@/lib/email';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 try{
  const contentLength=Number(request.headers.get('content-length')||0);if(contentLength>30000)return Response.json({error:'Request is too large'},{status:413});
  const body=await request.json();if(body.website)return Response.json({ok:true}); // honeypot
  if(process.env.TURNSTILE_SECRET_KEY){
   if(!body.turnstileToken)return Response.json({error:'Complete the anti-spam check'},{status:400});
   const params=new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:body.turnstileToken});
   const resp=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:params,cache:'no-store'});
   const result=await resp.json();if(!result.success)return Response.json({error:'Anti-spam verification failed'},{status:400});
  }
  const parsed=leadSchema.safeParse(body);if(!parsed.success)return Response.json({error:'Please check the required fields',issues:parsed.error.flatten()},{status:400});
  const d=parsed.data,client=db();const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  const ipHash=createHash('sha256').update(ip+String(process.env.SUPABASE_SERVICE_ROLE_KEY)).digest('hex');
  const fromTime=new Date(Date.now()-60*60*1000).toISOString();
  const {count}=await client.from('leads').select('*',{head:true,count:'exact'}).eq('ip_hash',ipHash).gte('created_at',fromTime);
  if((count||0)>=5)return Response.json({error:'Too many submissions. Please contact us directly.'},{status:429});
  const quoteNumber=`WQ-${new Date().getUTCFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
  const payload={quote_number:quoteNumber,contact_name:d.contactName,contact_email:d.contactEmail,phone:d.phone,company_name:d.companyName,website_name:d.websiteName,project_reference:d.projectReference,current_website:d.currentWebsite,industry:d.industry,package:d.package,quoted_price:PACKAGES[d.package].price,target_go_live:d.targetGoLive,project_description:d.projectDescription,required_sections:d.requiredSections,desired_features:d.desiredFeatures,branding_ready:d.brandingReady,content_ready:d.contentReady,hosting_ready:d.hostingReady,domain_name:d.domainName,special_requests:d.specialRequests,terms_accepted:d.termsAccepted,ip_hash:ipHash};
  const {data:lead,error}=await client.from('leads').insert(payload).select('*').single();if(error)throw error;
  await client.from('lead_events').insert({lead_id:lead.id,actor:'client',action:'submitted',detail:'Quote request received'});
  try{
   await notifyProvider(lead);await client.from('leads').update({notification_status:'sent',notification_error:null}).eq('id',lead.id);
   await client.from('lead_events').insert({lead_id:lead.id,actor:'system',action:'provider_notified'});
  }catch(error){
   await client.from('leads').update({notification_status:'failed',notification_error:String(error).slice(0,500)}).eq('id',lead.id);
   await client.from('lead_events').insert({lead_id:lead.id,actor:'system',action:'notification_failed',detail:String(error).slice(0,500)});
  }
  return Response.json({ok:true,quoteNumber},{status:201});
 }catch(error){console.error('Lead intake error',error);return Response.json({error:'Could not submit right now. Please try again later.'},{status:500})}
}
