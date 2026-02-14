-- Verow.co Client Queue Tool Schema

-- Enums
create type priority_level as enum ('standard', 'priority');
create type request_status as enum ('received', 'queued', 'in_progress', 'review', 'complete');
create type service_tier as enum ('retainer', 'standard', 'priority');

-- Clients table
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  company text,
  service_tier service_tier not null default 'standard',
  retainer_hours numeric(5,1),
  retainer_hours_used numeric(5,1) not null default 0,
  created_at timestamptz not null default now()
);

-- Requests table
create table requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text not null,
  assets text not null default '',
  priority_level priority_level not null default 'standard',
  status request_status not null default 'received',
  submitted_at timestamptz not null default now(),
  scheduled_start date not null,
  estimated_delivery date,
  completed_at timestamptz,
  production_hours numeric(5,1),
  notes text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_requests_client_id on requests(client_id);
create index idx_requests_status on requests(status);
create index idx_requests_scheduled_start on requests(scheduled_start);

-- Row Level Security
alter table clients enable row level security;
alter table requests enable row level security;

-- Policies: Clients can read their own data
create policy "Clients can view own profile"
  on clients for select
  using (auth.uid() = id);

-- Policies: Clients can read their own requests
create policy "Clients can view own requests"
  on requests for select
  using (client_id = auth.uid());

-- Policies: Clients can insert their own requests
create policy "Clients can submit requests"
  on requests for insert
  with check (client_id = auth.uid());

-- Admin role: full access (use service_role key server-side)
-- For admin UI, you can also create a custom role or use Supabase dashboard
