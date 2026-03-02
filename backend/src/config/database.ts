 import { Pool } from 'pg';
import { config } from './environment';

export const pool = new Pool({
    connectionString: config.databaseUrl,
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL bağlantısı başarılı');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL bağlantı hatası:', err);
    process.exit(-1);
});

export default pool;