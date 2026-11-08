create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  file_name text not null,
  tag text not null,
  title text not null default '',
  status text not null,
  label text not null,
  lca_score real not null,
  ux_score real not null,
  parsed jsonb not null,
  scoring jsonb not null,
  raw_text text not null,
  file bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists candidates_session_idx on candidates (session_id);
