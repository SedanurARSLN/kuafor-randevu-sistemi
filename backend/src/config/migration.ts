import pool from './database';

const createTables = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            full_name       VARCHAR(100) NOT NULL,
            email           VARCHAR(150) UNIQUE NOT NULL,
            password_hash   VARCHAR(255) NOT NULL,
            phone           VARCHAR(20),
            role            VARCHAR(20) DEFAULT 'customer' 
                            CHECK (role IN ('customer', 'provider', 'admin')),
            created_at      TIMESTAMP DEFAULT NOW(),
            updated_at      TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS services (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider_id     UUID REFERENCES users(id) ON DELETE CASCADE,
            name            VARCHAR(100) NOT NULL,
            description     TEXT,
            duration_min    INTEGER NOT NULL,
            price           DECIMAL(10,2) NOT NULL,
            is_active       BOOLEAN DEFAULT true,
            created_at      TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id     UUID REFERENCES users(id) ON DELETE CASCADE,
            service_id      UUID REFERENCES services(id) ON DELETE CASCADE,
            provider_id     UUID REFERENCES users(id) ON DELETE CASCADE,
            appointment_date DATE NOT NULL,
            start_time      TIME NOT NULL,
            end_time        TIME NOT NULL,
            status          VARCHAR(20) DEFAULT 'pending'
                            CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
            notes           TEXT,
            created_at      TIMESTAMP DEFAULT NOW(),
            updated_at      TIMESTAMP DEFAULT NOW()
        );

        -- Şema güncellemeleri
        ALTER TABLE appointments 
            ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) NOT NULL DEFAULT 0;

        ALTER TABLE appointments 
            ALTER COLUMN end_time DROP NOT NULL;

        -- service_id: UUID -> TEXT (çoklu hizmet desteği için virgülle ayrılmış ID'ler)
        ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;
        ALTER TABLE appointments ALTER COLUMN service_id TYPE TEXT USING service_id::text;

        CREATE TABLE IF NOT EXISTS reviews (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            appointment_id  UUID REFERENCES appointments(id) ON DELETE CASCADE,
            customer_id     UUID REFERENCES users(id) ON DELETE CASCADE,
            rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment         TEXT,
            created_at      TIMESTAMP DEFAULT NOW()
        );

        -- Ödeme alanları
        ALTER TABLE appointments
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'
                CHECK (payment_status IN ('pending', 'paid', 'refunded'));

        ALTER TABLE appointments
            ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

        -- Şifre sıfırlama alanları
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS reset_code VARCHAR(6);

        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMP;

        CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
        CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
    `;

    try {
        await pool.query(query);
        console.log('✅ Tablolar başarıyla oluşturuldu');
    } catch (error) {
        console.error('❌ Tablo oluşturma hatası:', error);
        throw error;
    }
};

export default createTables;