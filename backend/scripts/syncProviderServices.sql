-- Sedanur Kuafor'daki hizmetleri tüm kuaförlere ekler
-- Sedanur Kuafor'un id'sini aşağıda gerçek id ile değiştirin

DO $$
DECLARE
    sedanur_id UUID := 'SEDANUR_KUAFOR_ID'; -- Sedanur Kuafor'un gerçek id'si
BEGIN
    -- Tüm kuaförlerin id'lerini al
    FOR kuafor IN SELECT id FROM users WHERE role = 'provider' LOOP
        -- Sedanur Kuafor'daki hizmetleri bu kuaföre ekle
        INSERT INTO services (name, price, duration_minutes, provider_id, is_active)
        SELECT name, price, duration_minutes, kuafor.id, true
        FROM services
        WHERE provider_id = sedanur_id
        AND NOT EXISTS (
            SELECT 1 FROM services s2 WHERE s2.name = services.name AND s2.provider_id = kuafor.id
        );
    END LOOP;
END $$;

-- Not: sedanur_id'yi gerçek Sedanur Kuafor id'si ile değiştirin.
-- Bu scripti psql veya DBeaver ile çalıştırabilirsiniz.