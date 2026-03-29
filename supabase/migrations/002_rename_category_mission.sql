-- 카테고리 '선교여행' → '선교' 변경
-- 기존 데이터 업데이트
UPDATE grace_events SET category = '선교' WHERE category = '선교여행';

-- CHECK 제약 재설정
ALTER TABLE grace_events DROP CONSTRAINT IF EXISTS grace_events_category_check;
ALTER TABLE grace_events ADD CONSTRAINT grace_events_category_check
  CHECK (category IN ('수련회', '선교', '캠프', '예배', '모임', '개인'));
