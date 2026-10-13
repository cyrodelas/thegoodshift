import 'server-only';
import {PDFDocument, StandardFonts, rgb, PDFFont, PDFPage} from 'pdf-lib';
import {PACKAGES,PackageKey,formatUSD} from './catalog';

type Quote = Record<string,any>;
const blue=rgb(.13,.22,.36),gray=rgb(.40,.45,.51),light=rgb(.93,.95,.97),accent=rgb(.20,.38,.69);
export async function makeQuotePdf(lead:Quote,official=false):Promise<Uint8Array>{
 const pdf=await PDFDocument.create(); const font=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 let page:PDFPage=pdf.addPage([612,792]);let y=744;
 const margin=50, usable=512;
 function fresh(){page=pdf.addPage([612,792]);y=744}
 function line(text:string,size=10,f:PDFFont=font,color=blue,indent=0){
  const normalized=(text||'—').replace(/[\u2013\u2014]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[^\x20-\x7E]/g,'');
  const words=normalized.split(/\s+/);let buffer='';
  for(const word of words){const proposal=buffer?buffer+' '+word:word;if(f.widthOfTextAtSize(proposal,size)>usable-indent && buffer){if(y<66)fresh();page.drawText(buffer,{x:margin+indent,y,size,font:f,color});y-=size+5;buffer=word;}else{buffer=proposal;}}
  if(buffer){if(y<66)fresh();page.drawText(buffer,{x:margin+indent,y,size,font:f,color});y-=size+5;}
 }
 function heading(label:string){y-=12;if(y<105)fresh();line(label.toUpperCase(),10,bold,accent);y-=5;}
 function field(label:string,value:string){line(`${label}: ${value||'Not supplied'}`,10,font,blue);}
 // Header
 line(process.env.PROVIDER_NAME||'GOODSHIFT',11,bold,accent);y-=12;
 line(official?'OFFICIAL WEBSITE DEVELOPMENT QUOTATION':'CLIENT QUOTATION REQUEST - INTERNAL REVIEW',18,bold,blue);y-=7;
 line(`Reference: ${lead.quote_number}`,10,bold,gray);
 line(`Prepared: ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}`,9,font,gray);
 line(`Status: ${official?'Approved for client delivery':'Pending provider review - not an official offer'}`,9,font,gray);
 y-=8;
 page.drawRectangle({x:margin,y:y-10,width:usable,height:4,color:accent});y-=28;
 heading('Client and project information');
 field('Client',lead.company_name);field('Contact',`${lead.contact_name} (${lead.contact_email})`);
 field('Phone',lead.phone);field('Website / project',lead.website_name);field('Project reference',lead.project_reference);
 field('Existing website',lead.current_website);field('Industry',lead.industry);field('Target go-live',lead.target_go_live);
 heading('Selected development package');
 const pkg=PACKAGES[lead.package as PackageKey];
 line(`${pkg.name.toUpperCase()} PACKAGE    ${formatUSD(lead.quoted_price)} (one-time)`,14,bold,accent);
 line(`Indicative delivery: ${pkg.timeline}`,10,font,gray);y-=4;
 pkg.features.forEach((feature)=>line(`- ${feature}`,9,font,blue,8));
 heading('Requested content and functional needs');
 field('Website sections',(lead.required_sections||[]).join(', '));
 field('Requested features',(lead.desired_features||[]).join(', '));
 field('Project description',lead.project_description);field('Additional requests',lead.special_requests);
 heading('Content and hosting readiness');
 field('Branding',lead.branding_ready);field('Content',lead.content_ready);field('Hosting',lead.hosting_ready);field('Domain',lead.domain_name);
 heading('Financial terms and scope');
 line(`One-time project development fee: ${formatUSD(lead.quoted_price)}`,11,bold,blue);
 line('Payment schedule: 40% at signing; 30% after design/staging approval; 30% on final acceptance before launch or handover.',9);
 line('Development only. Client provides and pays directly for hosting, domain, renewals, email and third-party services. No recurring maintenance or managed hosting is included.',9);
 line('Scope is limited to public-facing informational website functionality. Third-party integrations, private portals, back-office systems and e-commerce are excluded.',9);
 heading('30-day limited defect warranty and subsequent changes');
 line('For 30 calendar days from actual go-live, reproducible defects attributable to approved delivered scope are corrected without additional development fees if reported within that period.',9);
 line('New content or design changes, additional pages, new functionality, third-party issues and hosting support are excluded from the defect warranty.',9);
 line('After day 30, every website change or support request must receive a separate quotation and the client\'s written approval before work begins. Out-of-scope work may be quoted at any time.',9);
 heading('Rights, acceptance and contract status');
 line('Final rights to specifically commissioned deliverables transfer as agreed after full payment; pre-existing and third-party components remain subject to their licenses.',9);
 line('This PDF summarizes the proposed work. A signed Service Agreement, confirmed scope, client details and agreed governing law/liability provisions govern the engagement.',9);
 heading('Detailed service agreement');
 const clauses = [
 ['01 - Scope and exclusions','The Provider delivers only the selected front-facing informational website features. E-commerce, customer portals, operational systems, custom business backends, payment processing, third-party integrations, and ongoing administration are excluded unless expressly agreed in writing.'],
 ['02 - Client cooperation','Client will provide lawful copy, imagery, brand assets, timely feedback, and client-owned hosting/domain access. Client delays or incomplete materials may affect the project schedule.'],
 ['03 - Reviews and additional work','The Client will consolidate design feedback within five business days where reasonably possible. Work outside the signed scope requires a written quotation, client approval, and any revised schedule.'],
 ['04 - Fees and payments','The selected price is a one-time fee, payable at 40% signing, 30% design/staging approval, and 30% final acceptance. Client separately contracts for and pays hosting, domain, email, licenses, plugins, and third-party services.'],
 ['05 - Launch and warranty','A 30-calendar-day defect warranty begins at production go-live. It is not a maintenance plan. Following day 30, every website update and support request requires separate written quotation and approval; non-defect or out-of-scope changes can be quoted earlier.'],
 ['06 - Acceptance and handover','After meeting agreed acceptance criteria and receipt of final payment, Provider will complete the agreed handover. Client-requested changes after acceptance are new work, except for defects covered by warranty.'],
 ['07 - Intellectual property','After full payment, Client receives the agreed rights to specifically commissioned final website deliverables. Provider pre-existing tools and reusable components, and third-party/open-source assets, retain their existing licensing and ownership.'],
 ['08 - Confidentiality','Each party will take reasonable care to protect confidential project information, except as required by law or authorized.'],
 ['09 - Delays and termination','Either party may terminate for material breach not remedied within 15 calendar days of written notice. Completed work and agreed non-cancellable expenses remain payable through termination, subject to law and written settlement.'],
 ['10 - Liability and governing law','To the extent allowed by law, neither party is liable for indirect or consequential losses. Before signing, the parties must agree on liability cap, venue, and governing law: '+(process.env.PROVIDER_GOVERNING_LAW||'[GOVERNING LAW / JURISDICTION TO BE AGREED]')+'; liability cap: '+(process.env.PROVIDER_LIABILITY_LIMIT||'[LIMIT TO BE AGREED]')+'.'],
 ['11 - Changes to agreement','Material amendments must be agreed in writing. This quotation creates no recurring maintenance or hosting agreement.']
 ];
 for (const [head,body] of clauses){line(head,9,bold,accent);line(body,9,font,blue);y-=3}
 heading('Project and commercial acceptance');
 line(`Client / Company: ${lead.company_name}`,9);line(`Website / Project: ${lead.website_name}`,9);
 line(`Chosen package: ${pkg.name} | One-time development fee: ${formatUSD(lead.quoted_price)} | Monthly recurring fees: None`,9,bold);
 line('Client representative name: ______________________________________',9);
 line('Client signature / date: __________________________________________',9);
 line('Service provider name: __________________________________________',9);
 line('Service provider signature / date: _________________________________',9);

 if(official){line('Officially issued by the Provider. Client acceptance and execution of the Service Agreement remain required before commencement.',9,bold,accent);}
 else line('Internal intake only. Not a binding or approved proposal; price and scope require provider review.',9,bold,gray);
 pdf.setTitle(`${official?'Official quotation':'Quotation request'} ${lead.quote_number}`);
 pdf.setAuthor(process.env.PROVIDER_NAME||'Website Provider');
 return pdf.save();
}
