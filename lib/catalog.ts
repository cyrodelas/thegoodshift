export type PackageKey = 'basic'|'plus'|'premium';
export const PACKAGES = {
 basic: {name:'Basic', price:3900, timeline:'4–6 weeks', eyebrow:'ESTABLISH YOUR PRESENCE', description:'A polished, responsive front-facing informational website.', features:['Custom responsive website design','Company and services information','Standard contact / inquiry form','SEO and analytics foundations','Testing, deployment and handover']},
 plus: {name:'Plus', price:5200, timeline:'5–7 weeks', eyebrow:'GROW WITH CONTENT', description:'Editorial control and better lead capture as your company grows.', features:['Everything in Basic','Self-service content management (CMS)','Blog and resource publishing','Expanded FAQs and testimonials','Enhanced inquiry capture and conversion tracking']},
 premium: {name:'Premium', price:6500, timeline:'6–8 weeks', eyebrow:'CONVERT MORE VISITORS', description:'Smarter inquiry workflows and richer conversion insights.', features:['Everything in Plus','Conditional inquiry forms','Rules-based inquiry notification emails','Appointment request collection (not live booking)','Enhanced visitor and conversion analytics']}
} as const;
export const SECTIONS = ['Home','About Us','Services','Contact','FAQs','Testimonials','Blog / Resources','Gallery / Portfolio','Careers','Other'];
export const FEATURE_CHOICES = ['Contact form','Blog / CMS','FAQ section','Testimonials','Appointment request','Conditional inquiry','Inquiry email notifications','Enhanced analytics'];
export const formatUSD = (n:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
