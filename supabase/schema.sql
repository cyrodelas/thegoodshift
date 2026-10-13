-- Execute in Supabase SQL Editor before using the app.
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending_review' check (status in ('pending_review','sending','approved_sent','delivery_failed','rejected')),
  contact_name text not null,
  contact_email text not null,
  phone text,
  company_name text not null,
  website_name text not null,
  project_reference text,
  current_website text,
  industry text,
  package text not null check (package in ('basic','plus','premium')),
  quoted_price integer not null,
  target_go_live text,
  project_description text,
  required_sections text[] not null default '{}',
  desired_features text[] not null default '{}',
  branding_ready text,
  content_ready text,
  hosting_ready text,
  domain_name text,
  special_requests text,
  admin_notes text,
  terms_accepted boolean not null default false,
  notification_status text not null default 'pending',
  notification_error text,
  client_email_id text,
  approved_at timestamptz,
  approved_by text,
  rejected_at timestamptz,
  client_email_error text,
  ip_hash text
);

create index if not exists idx_leads_created on public.leads(created_at desc);
create index if not exists idx_leads_status on public.leads(status, created_at desc);
create index if not exists idx_leads_ip on public.leads(ip_hash, created_at desc);

-- Client data is accessible only through authenticated, server-side routes.
alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;

create table if not exists public.lead_events (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  actor text not null,
  action text not null,
  detail text
);
alter table public.lead_events enable row level security;
revoke all on public.lead_events from anon, authenticated;

-- Admin endpoints use service role only after verifying Supabase user and allowlisted email.
