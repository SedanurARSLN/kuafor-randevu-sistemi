import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { errorHandler } from './middlewares/errorHandler';
import { generalLimiter } from './middlewares/rateLimiter';
import createTables from './config/migration';
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import paymentRoutes from './routes/paymentRoutes';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: config.allowedOrigins,
    credentials: true,
}));
app.use(generalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '💈 Kuaför Randevu Sistemi API çalışıyor!',
        timestamp: new Date().toISOString(),
    });
});

// ─── Privacy Policy
app.get('/privacy-policy', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Gizlilik Politikasi - Kuafor Randevu</title>
<style>body{font-family:-apple-system,sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#1E293B;line-height:1.7}
h1{color:#2563EB}h2{color:#1D4ED8;margin-top:24px}p{margin:8px 0}</style></head><body>
<h1>Gizlilik Politikasi</h1><p><strong>Son guncelleme:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
<h2>1. Toplanan Veriler</h2>
<p>Uygulamamiz asagidaki verileri toplar:</p>
<ul><li>Ad soyad, e-posta adresi, telefon numarasi</li><li>Randevu bilgileri (tarih, saat, secilen hizmetler)</li></ul>
<h2>2. Verilerin Kullanimi</h2>
<p>Toplanan veriler yalnizca randevu olusturma, yonetme ve kullanici hesap islemleri icin kullanilir. Verileriniz ucuncu taraflarla paylasilmaz.</p>
<h2>3. Veri Guveniligi</h2>
<p>Sifreler bcrypt ile sifrelenir. Tum iletisim HTTPS uzerinden gerceklesir. JWT token tabanli kimlik dogrulama kullanilir.</p>
<h2>4. Veri Saklama</h2>
<p>Verileriniz hesabiniz aktif oldugu surece saklanir. Hesabinizi istediginiz zaman uygulama icerisinden silebilirsiniz.</p>
<h2>5. Haklariniz</h2>
<p>Hesabinizi ve tum iliskili verilerinizi uygulama ici "Hesabimi Sil" secenegi ile kalici olarak silebilirsiniz.</p>
<h2>6. Iletisim</h2>
<p>Sorulariniz icin: <strong>kuaforrandevu@gmail.com</strong></p>
</body></html>`);
});

// ─── Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);

// ─── Error Handler
app.use(errorHandler);

const startServer = async () => {
    // Önce server'ı başlat — DB geçici olarak erişilemez olsa bile API ayağa kalksın
    app.listen(config.port, () => {
        const baseUrl = `http://localhost:${config.port}`;
        console.log(`🚀 Server çalışıyor: ${baseUrl}`);
        console.log(`📋 Health check: ${baseUrl}/api/health`);
        console.log(`🔐 Auth: ${baseUrl}/api/auth`);
        console.log(`💈 Services: ${baseUrl}/api/services`);
        console.log(`📅 Appointments: ${baseUrl}/api/appointments`);
    });

    // Tabloları oluştur — bağlantı yeniden denenebilir
    const tryMigrate = async (attempt = 1): Promise<void> => {
        try {
            await createTables();
        } catch (error) {
            console.error(`❌ Migration hatası (deneme ${attempt}):`, error);
            if (attempt < 5) {
                const delay = attempt * 3000;
                console.log(`⏳ ${delay / 1000}s sonra yeniden denenecek...`);
                setTimeout(() => tryMigrate(attempt + 1), delay);
            } else {
                console.error('❌ Migration 5 denemede başarısız — DB bağlantısını kontrol edin.');
            }
        }
    };

    tryMigrate();
};

startServer();