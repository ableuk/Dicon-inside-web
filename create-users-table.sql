-- users 테이블 생성 (RLS 정책 포함)
-- Supabase Dashboard → SQL Editor에서 실행하세요

create table if not exists users (
  id uuid references auth.users primary key,
  email text not null,
  name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS 활성화
alter table users enable row level security;

-- 기존 정책 삭제 (있을 경우)
drop policy if exists "Users can view own profile" on users;
drop policy if exists "Users can update own profile" on users;
drop policy if exists "Users can insert own profile" on users;

-- 사용자는 자신의 프로필을 볼 수 있음
create policy "Users can view own profile"
  on users for select
  to authenticated
  using (auth.uid() = id);

-- 사용자는 자신의 프로필을 수정할 수 있음
create policy "Users can update own profile"
  on users for update
  to authenticated
  using (auth.uid() = id);

-- 사용자는 자신의 프로필을 생성할 수 있음
create policy "Users can insert own profile"
  on users for insert
  to authenticated
  with check (auth.uid() = id);
