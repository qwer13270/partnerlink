-- Seed default FAQ content items for existing 商案 projects that have none.
-- Safe to run multiple times — the NOT EXISTS guard prevents duplicates.
INSERT INTO property_content_items (property_id, group_key, item_key, title, body, meta, accent, state, sort_order)
SELECT
  p.id,
  'shop_faq',
  faq.item_key,
  faq.title,
  faq.body,
  NULL,
  NULL,
  NULL,
  faq.sort_order
FROM projects p
CROSS JOIN (
  VALUES
    ('faq_1', '如何下單？',     '點選商品頁面的「立即購買」按鈕，即可前往結帳頁面完成訂購。', 0),
    ('faq_2', '運費怎麼計算？', '訂單滿 NT$1,000 免運費，未滿則收取 NT$60 運費。',           1),
    ('faq_3', '可以退換貨嗎？', '商品未使用且保持原包裝，7 天內可申請退換貨。',               2)
) AS faq(item_key, title, body, sort_order)
WHERE p.type = '商案'
  AND NOT EXISTS (
    SELECT 1
    FROM property_content_items ci
    WHERE ci.property_id = p.id
      AND ci.group_key = 'shop_faq'
  );
