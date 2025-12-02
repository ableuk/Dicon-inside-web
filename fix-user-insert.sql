-- 1단계: 현재 인증된 사용자 확인
SELECT id, email, raw_user_meta_data FROM auth.users;

-- 2단계: 위에서 확인한 정확한 ID를 사용하여 users 테이블에 삽입
-- (위 쿼리 결과를 보고 id 값을 복사해서 아래에 붙여넣으세요)

-- INSERT INTO users (id, email, name, role, created_at)
-- VALUES (
--   'PASTE_ID_HERE',  -- 위에서 확인한 정확한 ID
--   'PASTE_EMAIL_HERE',  -- 위에서 확인한 이메일
--   '김진욱',  -- 이름
--   'admin',  -- 역할
--   NOW()
-- );
