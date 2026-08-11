-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query) to set up storage.

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  family_name text not null,
  allowed_adults integer not null default 2,
  allowed_children integer not null default 0,
  rsvp_status text not null default 'pending' check (rsvp_status in ('pending', 'attending', 'declined')),
  rsvp_adults integer,
  rsvp_children integer,
  rsvp_email text,
  rsvp_phone text,
  rsvp_at timestamptz,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists guests_code_idx on guests (code);

create table if not exists guest_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  blessing text,
  song text,
  created_at timestamptz not null default now()
);

-- Row Level Security stays on with no public policies: only the service_role key
-- (used server-side in the Netlify Functions) can read/write. The browser never
-- talks to Supabase directly, so no public policy is needed.
alter table guests enable row level security;
alter table guest_messages enable row level security;

-- Example: add a household. Run one insert per invited family/household.
-- insert into guests (code, family_name, allowed_adults, allowed_children)
-- values ('AB72KD', 'Kamau Family', 2, 2);
