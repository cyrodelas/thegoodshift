# GoodShift | Website Quotation & Approval Portal

Production-oriented Next.js starter for **Vercel**. It implements the development-only proposal based on the supplied quotation:

- **Basic:** USD 3,900, 4–6 weeks
- **Plus:** USD 5,200, 5–7 weeks
- **Premium:** USD 6,500, 6–8 weeks

There is **no ongoing maintenance or hosting package** in this version. The client pays for and manages their own domain and hosting. A limited **30-calendar-day defect warranty** starts at actual go-live; changes and additional services thereafter are quoted separately. Scope expansions can be quoted even during the warranty period.

## GoodShift brand assets

- `public/goodshift-logo.png`: master stacked GoodShift logo.
- `public/goodshift-icon.png`: cropped transparent arrow/G symbol used in navigation.
- `public/goodshift-icon-small.png`: reduced icon for external uses.
- Header, footer, private dashboard, document sender identity, and PDF provider name now use GoodShift.
- To deliver emails as GoodShift, verify your sending domain and set `EMAIL_FROM=GoodShift <quotes@your-verified-domain.com>` in Vercel. The sample domain is not preverified.

## Working features

1. Responsive public landing page, package comparison, multi-step client intake form.
2. Client inputs: business/contact info, website/project name, project description, target date, sections, features, branding/content/hosting readiness, domain and special requests.
3. Server validates each request, records it as a new lead in Supabase, allocates a unique reference number, and rate-limits submissions by hashed IP. Optional Cloudflare Turnstile verification.
4. Creates an **internal quotation-request PDF** and emails it to you through Resend as an attachment.
5. Private `/admin` dashboard via Supabase email/password login; only the email matching `ADMIN_EMAIL` can access lead APIs.
6. Dashboard provides lead list, search, status filtering, activity history, package and price review, PDF preview/download, private notes, rejection, and retry failed notification.
7. **Approve & Send** generates an **official quote PDF** and emails it to the client. Not sent until admin clicks approve.
8. Logs activity and delivery attempts in Supabase. Handles email errors and supports retry.

## Architecture

- Next.js 15 App Router / React 19 / TypeScript
- Supabase PostgreSQL and Supabase Authentication
- Resend for email with PDF attachments
- `pdf-lib` for generated PDFs
- Vercel hosting for the application itself

## Setup

1. Create a **Supabase** project; open the SQL Editor and execute `supabase/schema.sql`.
2. Under Supabase **Authentication > Users**, create/invite your admin user with a strong password. Disable public self-signup if only one admin is needed. Use the **exact same email** in `ADMIN_EMAIL`.
3. Create a **Resend** account, verify your sending domain and obtain an API key. Use a sender address on that verified domain for `EMAIL_FROM`. Enter your receiving address in `LEADS_TO_EMAIL`.
4. Copy `.env.example` to `.env.local`, then add all required Supabase, Resend and provider details. **Never expose the Supabase service-role key, Resend API key or Turnstile secret in NEXT_PUBLIC variables.**
5. Install and run locally:

   ```bash
   npm install
   npm run dev
   ```

   Open `http://localhost:3000` and `http://localhost:3000/admin`.

6. Push the folder to a GitHub repository and import that repository in **Vercel > Add New Project**. Copy environment variables into **Vercel Project Settings > Environment Variables**, then deploy. Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS URL and redeploy.
7. Submit a test lead, verify lead and incoming email, sign in to `/admin`, open/download the preview, and **approve a test quotation**. Check that the client's official PDF arrives.
8. Replace all temporary brand details, provider contact info, and legal placeholders before accepting real clients.

## Important production considerations

- This is a **deployable source project**, not an already deployed live site. Real email delivery and lead storage require your own Supabase, Vercel and Resend accounts and credentials. Do not commit `.env.local`.
- The PDF is a **quotation summary**, not a fully executed services contract. Obtain client signatures to the final scope and Service Agreement (including governing law and limitation of liability) before work begins.
- PDF uses standard built-in fonts and replaces a few special glyphs for portability.
- Approving a quote records `approved_sent` only after Resend accepts the outbound message. Acceptance by Resend is **not the same as confirmed inbox delivery**. For production-grade delivery confirmations and retry safety, register signed Resend webhooks and use an outbox/idempotency design. If delivery state is unknown after a provider timeout, check Resend first before clicking Retry.
- Email notification failure does not erase a lead: the lead remains stored and visible to the admin, with a `notification_status` of `failed`. Use **Retry alert**.
- The IP-based rate limit uses database records and one-hour lookback. Add Cloudflare Turnstile for more rigorous anti-abuse protection before public launch.
- Domain/hosting readiness is collected even though development-only clients provide those resources themselves.
- Private admin notes are stored as internal information and **are not included in the official client PDF**.
- Turnstile anti-spam protection is implemented. Set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` from the same Cloudflare Turnstile widget; the server requires a verified token when the secret is set.
- If a customer requests a different package scope or other legal terms, edit this starter's catalog and quotation generation accordingly.

## Operational flow

```text
Public website -> Client intake form -> Server validation -> Supabase lead
                                                |-> Internal PDF -> Email to provider
Private admin -> Review lead -> Edit price -> Preview PDF -> Approve & Send
                                                |-> Official PDF -> Email to client
                                                |-> Update status & audit trail
```

## Files of interest

- `lib/catalog.ts` — source of all 3 prices and package descriptions.
- `lib/pdf.ts` — internal and official quotation PDFs.
- `lib/email.ts` — notification and approved quotation emails.
- `app/api/leads/route.ts` — incoming lead API.
- `app/api/admin/*` — authenticated administrative endpoints.
- `app/admin/page.tsx` — admin leads and approvals.
- `supabase/schema.sql` — database tables, indexes and private RLS setup.
- `app/globals.css` — all website styles.
