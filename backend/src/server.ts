import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { errorHandler } from './middlewares/errorHandler';
import createTables from './config/migration';
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ngrok "Visit Site" bypass
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// ─── Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '💈 Kuaför Randevu Sistemi API çalışıyor!',
        timestamp: new Date().toISOString(),
    });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Kuaför Randevu API</h1>
    <p>Merhaba! API çalışıyor ve aktif durumda. Lütfen uygun bir endpoint kullanın:</p>
    <ul>
      <li><a href="/api/health">/api/health</a> - Sağlık kontrolü</li>
      <li>/api/auth/book/:providerId - Kuaför randevu sayfası</li>
      <li>/api/auth/login - API ile giriş yapmak için</li>
      <li>/api/services - Kuaför hizmetleri</li>
    </ul>
  `);
});

app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kuaför Giriş Sistemi</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; background: #F8FAFC; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0px 4px 10px rgba(0,0,0,0.1); }
        input, button { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        button { background: #2563EB; color: white; border: none; cursor: pointer; }
        button:hover { background: #1D4ED8; }
      </style>
    </head>
    <body>
      <h1>Kuaför Giriş Sistemi</h1>
      <form id="loginForm">
        <input type="email" id="email" placeholder="Email Adresiniz" required />
        <input type="password" id="password" placeholder="Şifre" required />
        <button type="submit">Giriş Yap</button>
      </form>
      <div id="output" style="margin-top: 20px; font-weight: bold;"></div>
      <script>
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const output = document.getElementById('output');
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
              output.textContent = 'Başarılı Giriş! Kullanıcı Rolü: ' + data.data.role;
            } else {
              output.textContent = 'Hata: ' + data.message;
            }
          } catch (err) {
            output.textContent = 'Bağlantı hatası. Lütfen tekrar deneyin.';
          }
        });
      </script>
    </body>
    </html>
  `);
});


// ─── Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

// ─── Error Handler
app.use(errorHandler);

const startServer = async () => {
    try {
        await createTables();
        app.listen(config.port, () => {
            console.log(`🚀 Server çalışıyor: http://localhost:${config.port}`);
            console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
            console.log(`🔐 Auth: http://localhost:${config.port}/api/auth`);
            console.log(`💈 Services: http://localhost:${config.port}/api/services`);
            console.log(`📅 Appointments: http://localhost:${config.port}/api/appointments`);
        });
    } catch (error) {
        console.error('❌ Server başlatılamadı:', error);
        process.exit(1);
    }
};

startServer();