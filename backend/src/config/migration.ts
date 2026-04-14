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
            provider_id     UUID REFERENCES users(id) ON DELETE CASCADE,
            appointment_date DATE NOT NULL,
            start_time      TIME NOT NULL,
            end_time        TIME,
            status          VARCHAR(20) DEFAULT 'pending'
                            CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
            notes           TEXT,
            total_price     DECIMAL(10,2) NOT NULL DEFAULT 0,
            created_at      TIMESTAMP DEFAULT NOW(),
            updated_at      TIMESTAMP DEFAULT NOW()
        );

        -- Eski service_id kolonu varsa kaldır (önceki migration'dan kalma)
        ALTER TABLE appointments DROP COLUMN IF EXISTS service_id;

        -- Junction table
        CREATE TABLE IF NOT EXISTS appointment_services (
            appointment_id  UUID REFERENCES appointments(id) ON DELETE CASCADE,
            service_id      UUID REFERENCES services(id) ON DELETE CASCADE,
            PRIMARY KEY (appointment_id, service_id)
        );

        CREATE INDEX IF NOT EXISTS idx_appt_services_appointment ON appointment_services(appointment_id);
        CREATE INDEX IF NOT EXISTS idx_appt_services_service     ON appointment_services(service_id);

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

        -- Refresh token
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS refresh_token TEXT;

        -- Push notification token (Expo)
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

        -- Hatırlatma bildirimi gönderildi mi?
        ALTER TABLE appointments
            ADD COLUMN IF NOT EXISTS reminder_sent TIMESTAMP;

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