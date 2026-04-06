-- Add 'sponsored' (業配) as a collaboration type alongside 'commission' and 'reciprocal'
-- 業配: 公關商品 (items) + 業配獎金 (sponsorship_bonus) — for 商案 only
-- 互惠: 公關商品 (items) only                           — for 商案 only
-- commission: referral % of sale price                  — for 建案 only

alter table public.collaboration_requests
  drop constraint collaboration_requests_collaboration_type_check,
  add constraint collaboration_requests_collaboration_type_check
    check (collaboration_type in ('commission', 'reciprocal', 'sponsored'));

alter table public.collaborations
  drop constraint collaborations_collaboration_type_check,
  add constraint collaborations_collaboration_type_check
    check (collaboration_type in ('commission', 'reciprocal', 'sponsored'));
