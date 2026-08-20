create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  best_of integer not null check (best_of in (3, 5, 7)),
  match_date date,
  proof_type text not null check (proof_type in ('image', 'replay')),
  submitted_by text not null default 'Jugador de PanamaRivals',
  status text not null default 'uploading' check (status in ('uploading', 'pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create or replace function public.update_submissions_reviewed_at()
returns trigger language plpgsql as $$
begin
  if new.status in ('approved', 'rejected') and (old.status is distinct from new.status) then
    new.reviewed_at = now();
  end if;
  return new;
end $$;

drop trigger if exists submissions_reviewed_at_trigger on public.submissions;
create trigger submissions_reviewed_at_trigger
  before update on public.submissions
  for each row execute function public.update_submissions_reviewed_at();

create table if not exists public.proof_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  file_size bigint not null check (file_size > 0),
  mime_type text,
  uploaded boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists submissions_status_created_at_idx
  on public.submissions (status, created_at desc);

create index if not exists proof_files_submission_id_idx
  on public.proof_files (submission_id);

alter table public.submissions enable row level security;
alter table public.proof_files enable row level security;

insert into storage.buckets (id, name, public)
values ('match-proofs', 'match-proofs', false)
on conflict (id) do update set public = false;

drop policy if exists "Service role can upload proofs" on storage.objects;
create policy "Service role can upload proofs"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'match-proofs');

drop policy if exists "Service role can read proofs" on storage.objects;
create policy "Service role can read proofs"
  on storage.objects for select
  to service_role
  using (bucket_id = 'match-proofs');

drop policy if exists "Service role can update proofs" on storage.objects;
create policy "Service role can update proofs"
  on storage.objects for update
  to service_role
  using (bucket_id = 'match-proofs')
  with check (bucket_id = 'match-proofs');

drop policy if exists "Service role can delete proofs" on storage.objects;
create policy "Service role can delete proofs"
  on storage.objects for delete
  to service_role
  using (bucket_id = 'match-proofs');
