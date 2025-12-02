-- DCinside Web - Supabase Database Setup
-- 이 스크립트를 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. users 테이블이 이미 존재한다고 가정
-- 만약 없다면 아래 주석을 해제하고 실행
/*
create table if not exists users (
  id uuid references auth.users primary key,
  email text not null,
  name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table users enable row level security;

create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on users for insert
  with check (auth.uid() = id);
*/

-- 2. notices 테이블 생성
drop table if exists notices cascade;

create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author_id uuid not null references users(id) on delete cascade,
  is_pinned boolean default false,
  is_important boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- notices 테이블 RLS 활성화
alter table notices enable row level security;

-- 모든 인증된 사용자는 공지사항 읽기 가능
create policy "Anyone can view notices"
  on notices for select
  to authenticated
  using (true);

-- 관리자만 공지사항 작성 가능
create policy "Admins can create notices"
  on notices for insert
  to authenticated
  with check (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 관리자만 공지사항 수정 가능
create policy "Admins can update notices"
  on notices for update
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 관리자만 공지사항 삭제 가능
create policy "Admins can delete notices"
  on notices for delete
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 3. suggestions 테이블 생성
drop table if exists suggestions cascade;

create table suggestions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('시설', '급식', '수업', '기타')),
  title text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed')),
  user_id uuid not null references users(id) on delete cascade,
  admin_note text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- suggestions 테이블 RLS 활성화
alter table suggestions enable row level security;

-- 사용자는 자신의 건의사항만 볼 수 있음
create policy "Users can view own suggestions"
  on suggestions for select
  to authenticated
  using (user_id = auth.uid());

-- 관리자는 모든 건의사항 볼 수 있음
create policy "Admins can view all suggestions"
  on suggestions for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 인증된 사용자는 건의사항 작성 가능
create policy "Authenticated users can create suggestions"
  on suggestions for insert
  to authenticated
  with check (user_id = auth.uid());

-- 관리자만 건의사항 상태 변경 가능
create policy "Admins can update suggestions"
  on suggestions for update
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 관리자만 건의사항 삭제 가능
create policy "Admins can delete suggestions"
  on suggestions for delete
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- 4. 인덱스 생성 (성능 최적화)
create index if not exists notices_author_id_idx on notices(author_id);
create index if not exists notices_created_at_idx on notices(created_at desc);
create index if not exists notices_is_pinned_idx on notices(is_pinned);

create index if not exists suggestions_user_id_idx on suggestions(user_id);
create index if not exists suggestions_created_at_idx on suggestions(created_at desc);
create index if not exists suggestions_status_idx on suggestions(status);

-- 완료!
-- 이제 애플리케이션에서 테이블을 사용할 수 있습니다.
