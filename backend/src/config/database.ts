import { Pool } from 'pg';
import { config } from './environment';

// Localhost dışındaki her bağlantı için SSL zorunlu
const isLocalhost = config.databaseUrl.includes('localhost')
    || config.databaseUrl.includes('127.0.0.1');

export const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL bağlantısı başarılı');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL bağlantı hatası:', err);
    // process.exit kaldırıldı — tekil bağlantı hatalarında server çökmemeli
});

export default pool;