import { z } from 'zod';
export const leadSchema = z.object({
 contactName:z.string().trim().min(2).max(120), contactEmail:z.email().max(254), phone:z.string().max(60).optional().default(''),
 companyName:z.string().trim().min(2).max(180), websiteName:z.string().trim().min(2).max(180),projectReference:z.string().max(120).optional().default(''),
 currentWebsite:z.string().max(250).optional().default(''),industry:z.string().max(150).optional().default(''),
 package:z.enum(['basic','plus','premium']), targetGoLive:z.string().max(80).optional().default(''), projectDescription:z.string().max(4000).optional().default(''),
 requiredSections:z.array(z.string().max(60)).max(25).default([]),desiredFeatures:z.array(z.string().max(100)).max(25).default([]),
 brandingReady:z.string().max(80).optional().default(''), contentReady:z.string().max(80).optional().default(''),hostingReady:z.string().max(80).optional().default(''),
 domainName:z.string().max(200).optional().default(''),specialRequests:z.string().max(4000).optional().default(''),
 termsAccepted:z.literal(true)
});
export type LeadInput = z.infer<typeof leadSchema>;
