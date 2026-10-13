import 'server-only';
import {mail,cleanText} from './server';
import {makeQuotePdf} from './pdf';
import {PACKAGES,PackageKey,formatUSD} from './catalog';
type Lead=Record<string,any>;
const from=()=>{if(!process.env.EMAIL_FROM)throw new Error('EMAIL_FROM not configured');return process.env.EMAIL_FROM};
const attachment = async(lead:Lead,official:boolean)=>[{filename:`${official?'Official-Quotation':'Request'}-${lead.quote_number}.pdf`,content:Buffer.from(await makeQuotePdf(lead,official))}];
export async function notifyProvider(lead:Lead){
 if(!process.env.LEADS_TO_EMAIL)throw new Error('LEADS_TO_EMAIL not configured');
 const response=await mail().emails.send({from:from(),to:[process.env.LEADS_TO_EMAIL],replyTo:lead.contact_email,subject:`New quotation request: ${lead.quote_number} - ${lead.company_name}`,html:`<h2>New website quotation request</h2><p><b>Client:</b> ${cleanText(lead.contact_name)} (${cleanText(lead.contact_email)})</p><p><b>Company:</b> ${cleanText(lead.company_name)}</p><p><b>Package:</b> ${cleanText(PACKAGES[lead.package as PackageKey].name)} - ${formatUSD(lead.quoted_price)}</p><p><b>Project:</b> ${cleanText(lead.website_name)}</p><p>The attached PDF contains the submitted client details. Review the lead and approve it in the private dashboard.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/admin">Open approval dashboard</a></p>`,attachments:await attachment(lead,false)});
 if(response.error) throw new Error(response.error.message);return response.data?.id;
}
export async function sendOfficial(lead:Lead){
 const response=await mail().emails.send({from:from(),to:[lead.contact_email],replyTo:process.env.PROVIDER_EMAIL||undefined,subject:`Official website development quotation ${lead.quote_number} - ${lead.company_name}`,html:`<p>Hello ${cleanText(lead.contact_name)},</p><p>Thank you for your interest in our website development services. Your request has been reviewed and approved for quotation.</p><p>Please find attached the official quotation for the <b>${cleanText(PACKAGES[lead.package as PackageKey].name)} Package</b> at <b>${formatUSD(lead.quoted_price)}</b> (one-time development).</p><p>The quotation is for development only. You will arrange your own hosting and domain. Covered defects are supported during the first 30 calendar days after go-live; new or subsequent website changes are quoted separately.</p><p>Approval of the quotation does not mean that development has begun. Please reply to confirm next steps, and we will finalize the agreement and project scope.</p><p>Best regards,<br/>${cleanText(process.env.PROVIDER_NAME||'Website Development Team')}</p>`,attachments:await attachment(lead,true)});
 if(response.error)throw new Error(response.error.message);return response.data?.id;
}
