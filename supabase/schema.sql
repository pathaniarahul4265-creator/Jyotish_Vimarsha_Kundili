
create extension if not exists pgcrypto;

create table if not exists public.settings (
  id integer primary key default 1,
  reveal_price numeric not null default 59,
  match_price numeric not null default 99,
  question_price numeric not null default 29,
  reveal_enabled boolean not null default true,
  match_enabled boolean not null default true,
  chat_enabled boolean not null default true,
  offer_enabled boolean not null default false,
  offer_percent numeric not null default 0,
  offer_label text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.settings(id) values (1) on conflict (id) do nothing;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  session_token text unique not null,
  order_id text unique not null,
  payment_id text,
  plan text not null,
  amount integer not null,
  status text not null default 'created',
  signature text,
  webhook_event text,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  webhook_at timestamptz
);
create index if not exists payments_order_idx on public.payments(order_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mode text not null default 'individual',
  email text,
  birth_summary text,
  report text not null,
  payment_ref text,
  vip boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reports_created_idx on public.reports(created_at desc);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists feedback_created_idx on public.feedback(created_at desc);

create table if not exists public.vip_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text unique not null,
  display_code text not null,
  active boolean not null default true,
  uses integer not null default 0,
  max_uses integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_key text unique not null,
  event_name text,
  received_at timestamptz not null default now()
);

alter table public.settings enable row level security;
alter table public.payments enable row level security;
alter table public.reports enable row level security;
alter table public.feedback enable row level security;
alter table public.vip_codes enable row level security;
alter table public.webhook_events enable row level security;

-- No public policies: the application uses the Supabase service role only on the server.

create or replace function public.consume_vip_code(p_hash text)
returns table(valid boolean, access text)
language plpgsql
security definer
set search_path = public
as $$
declare r public.vip_codes;
begin
  select * into r from public.vip_codes where code_hash=p_hash for update;
  if not found or not r.active or r.uses >= r.max_uses then
    return query select false, 'none';
    return;
  end if;
  update public.vip_codes set uses=uses+1 where id=r.id;
  return query select true, 'all';
end;
$$;
revoke execute on function public.consume_vip_code(text) from public, anon, authenticated;
grant execute on function public.consume_vip_code(text) to service_role;
