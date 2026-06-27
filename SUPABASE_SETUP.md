# Newsletter subscribers table

Run this in Supabase SQL Editor (one-time setup):

```sql
create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  created_at  timestamptz not null default now()
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter: anyone can subscribe" on public.newsletter_subscribers;
create policy "newsletter: anyone can subscribe"
  on public.newsletter_subscribers
  for insert
  with check (true);

drop policy if exists "newsletter: public read count" on public.newsletter_subscribers;
create policy "newsletter: public read count"
  on public.newsletter_subscribers
  for select
  using (true);
```

## View counter columns (for #3)

```sql
alter table public.projects
  add column if not exists views integer default 0 not null;

alter table public.ai_projects
  add column if not exists views integer default 0 not null;
```