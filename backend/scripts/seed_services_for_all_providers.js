const pool = require('../src/config/database');

async function seedServicesForAllProviders() {
  // Sedanur Kuafor'un hizmetlerini çek
  const sedanur = await pool.query("SELECT id FROM users WHERE full_name = 'Sedanur Kuafor'");
  if (!sedanur.rows.length) {
    console.error('Sedanur Kuafor bulunamadı!');
    return;
  }
  const sedanurId = sedanur.rows[0].id;
  const services = await pool.query('SELECT name, description, duration_min, price FROM services WHERE provider_id = $1', [sedanurId]);

  // Tüm kuaförleri çek
  const providers = await pool.query("SELECT id FROM users WHERE role = 'provider'");

  for (const provider of providers.rows) {
    for (const service of services.rows) {
      // Aynı isimde hizmet yoksa ekle
      const exists = await pool.query(
        'SELECT 1 FROM services WHERE provider_id = $1 AND name = $2',
        [provider.id, service.name]
      );
      if (!exists.rows.length) {
        await pool.query(
          'INSERT INTO services (provider_id, name, description, duration_min, price, is_active) VALUES ($1, $2, $3, $4, $5, true)',
          [provider.id, service.name, service.description, service.duration_min, service.price]
        );
      }
    }
  }
  console.log('Tüm kuaförlere Sedanur Kuafor hizmetleri eklendi!');
  process.exit(0);
}

seedServicesForAllProviders().catch(e => {
  console.error(e);
  process.exit(1);
});
