-- Tüm kuaförlere Sedanur Kuafor'daki hizmetleri ekler
-- Sedanur Kuafor'un id'sini aşağıda gerçek id ile değiştirin

-- Sedanur Kuafor'un id'sini bul
WITH sedanur AS (
  SELECT id FROM users WHERE full_name = 'Sedanur Kuafor'
),
kuaforler AS (
  SELECT id FROM users WHERE role = 'provider'
),
sedanur_services AS (
  SELECT name, price, duration_minutes FROM services WHERE provider_id = (SELECT id FROM sedanur)
)
INSERT INTO services (name, price, duration_minutes, provider_id, is_active)
SELECT s.name, s.price, s.duration_minutes, k.id, true
FROM sedanur_services s
CROSS JOIN kuaforler k
WHERE NOT EXISTS (
  SELECT 1 FROM services ss WHERE ss.name = s.name AND ss.provider_id = k.id
);

-- Bu scripti psql, DBeaver veya Render'ın veritabanı panelinde çalıştırabilirsiniz.