-- optional if we want uuid keys for articles/comments
create extension if not exists pgcrypto;

create table if not exists users_pb (
  pb_id text primary key,                  -- PocketBase record id (string)
  email text not null unique,
  display_name text not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  author_pb_id text not null,              -- FK-like reference to PocketBase users
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- optional snapshot for denormalized display without a join:
  author_snapshot jsonb
);

create index if not exists idx_articles_author_pb on articles(author_pb_id);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  author_pb_id text not null,
  body text not null,
  created_at timestamptz not null default now(),
  author_snapshot jsonb
);

create index if not exists idx_comments_article on comments(article_id);
create index if not exists idx_comments_author_pb on comments(author_pb_id);
