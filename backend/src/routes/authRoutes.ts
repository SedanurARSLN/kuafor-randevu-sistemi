import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { validateRequest } from '../middlewares/validateRequest';
import { registerCustomerValidator, registerProviderValidator, loginValidator } from '../validators/authValidator';
import { authenticate } from '../middlewares/authMiddleware';
import pool from '../config/database';

const router = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register/customer', registerCustomerValidator, validateRequest, authController.registerCustomer);
router.post('/register/provider', registerProviderValidator, validateRequest, authController.registerProvider);
router.post('/login', loginValidator, validateRequest, authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.get('/providers', authController.getAllProviders);
router.get('/providers/:id/services', authController.getProviderServices);

// ─── 🌐 WEB RANDEVU SAYFASI
router.get('/book/:providerId', async (req, res) => {
    try {
        const provider = await pool.query(
            "SELECT id, full_name, phone FROM users WHERE id = $1 AND role = 'provider'",
            [req.params.providerId]
        );

        if (provider.rows.length === 0) {
            return res.status(404).send('<h1>Kuaför bulunamadı</h1>');
        }

        const services = await pool.query(
            'SELECT * FROM services WHERE provider_id = $1 AND is_active = true',
            [req.params.providerId]
        );

        const p = provider.rows[0];
        const svcs = services.rows;

        const dates: string[] = [];
        for (let i = 1; i <= 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }

        const times = [
            '09:00','09:30','10:00','10:30','11:00','11:30',
            '12:00','12:30','13:00','13:30','14:00','14:30',
            '15:00','15:30','16:00','16:30','17:00','17:30'
        ];

        const html = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${p.full_name} - Randevu Al</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8FAFC; color: #1E293B; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { background: #2563EB; border-radius: 16px; padding: 24px; text-align: center; color: white; margin-bottom: 24px; }
        .header h1 { font-size: 24px; margin-bottom: 4px; }
        .header p { opacity: 0.8; font-size: 14px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 18px; margin-bottom: 12px; }
        .card { background: white; border-radius: 12px; padding: 16px; margin-bottom: 10px; border: 2px solid #E2E8F0; cursor: pointer; transition: all 0.2s; }
        .card:hover, .card.selected { border-color: #2563EB; background: #EFF6FF; }
        .card h3 { font-size: 16px; }
        .card .meta { color: #64748B; font-size: 13px; margin-top: 4px; }
        .card .price { color: #2563EB; font-weight: bold; font-size: 16px; margin-top: 4px; }
        .dates { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
        .date-card { min-width: 70px; text-align: center; background: white; border-radius: 12px; padding: 12px 8px; border: 2px solid #E2E8F0; cursor: pointer; flex-shrink: 0; }
        .date-card:hover, .date-card.selected { border-color: #2563EB; background: #EFF6FF; }
        .date-card .day { font-size: 12px; color: #64748B; }
        .date-card .num { font-size: 22px; font-weight: bold; margin: 4px 0; }
        .times { display: flex; flex-wrap: wrap; gap: 8px; }
        .time-card { padding: 10px 16px; background: white; border-radius: 12px; border: 2px solid #E2E8F0; cursor: pointer; font-weight: 600; font-size: 14px; }
        .time-card:hover, .time-card.selected { border-color: #2563EB; background: #EFF6FF; color: #2563EB; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 16px; background: white; }
        .form-group textarea { height: 80px; resize: none; }
        .summary { background: #EFF6FF; border: 1px solid #2563EB; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: none; }
        .summary h3 { color: #2563EB; margin-bottom: 8px; }
        .summary p { font-size: 14px; margin-bottom: 4px; }
        .summary .total { font-size: 18px; font-weight: bold; color: #2563EB; margin-top: 8px; }
        .btn { width: 100%; padding: 16px; background: #2563EB; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; }
        .btn:hover { background: #1D4ED8; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .success { display: none; text-align: center; padding: 40px 20px; }
        .success .icon { font-size: 60px; margin-bottom: 16px; }
        .success h2 { color: #10B981; margin-bottom: 8px; }
        .alert { background: #FEF2F2; border: 1px solid #EF4444; color: #EF4444; padding: 12px; border-radius: 12px; margin-bottom: 16px; display: none; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💈 ${p.full_name}</h1>
            <p>📞 ${p.phone}</p>
            <p style="margin-top:8px; font-size:16px;">Online Randevu Al</p>
        </div>

        <div id="bookingForm">
            <div class="section">
                <h2>👤 Bilgileriniz</h2>
                <div class="form-group">
                    <label>Ad Soyad</label>
                    <input type="text" id="fullName" placeholder="Adınız Soyadınız" required>
                </div>
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="tel" id="phone" placeholder="05XX XXX XXXX" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" placeholder="email@ornek.com" required>
                </div>
            </div>

            <div class="section">
                <h2>✂️ Hizmet Seçin</h2>
                <div id="servicesList">
                    ${svcs.map(s => `
                        <div class="card" onclick="selectService('${s.id}', '${s.name}', ${s.price}, ${s.duration_minutes}, this)">
                            <h3>${s.name}</h3>
                            <div class="meta">⏱ ${s.duration_minutes} dk</div>
                            <div class="price">${s.price} TL</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2>📅 Tarih Seçin</h2>
                <div class="dates">
                    ${dates.map(d => {
                        const dt = new Date(d);
                        const days = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
                        const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
                        return `<div class="date-card" onclick="selectDate('${d}', this)">
                            <div class="day">${days[dt.getDay()]}</div>
                            <div class="num">${dt.getDate()}</div>
                            <div class="day">${months[dt.getMonth()]}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <div class="section">
                <h2>🕐 Saat Seçin</h2>
                <div class="times">
                    ${times.map(t => `
                        <div class="time-card" onclick="selectTime('${t}', this)">${t}</div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2>📝 Not (opsiyonel)</h2>
                <div class="form-group">
                    <textarea id="notes" placeholder="Örn: Kısa kesim istiyorum"></textarea>
                </div>
            </div>

            <div class="summary" id="summary">
                <h3>📋 Randevu Özeti</h3>
                <p id="sumService"></p>
                <p id="sumDate"></p>
                <p id="sumTime"></p>
                <div class="total" id="sumPrice"></div>
            </div>

            <div class="alert" id="errorMsg"></div>

            <button class="btn" onclick="submitBooking()">📅 Randevu Al</button>
        </div>

        <div class="success" id="successMsg">
            <div class="icon">✅</div>
            <h2>Randevunuz Oluşturuldu!</h2>
            <p>Kuaförünüz en kısa sürede onaylayacak.</p>
            <p style="margin-top:16px; color:#64748B;">Bu sayfayı kapatabilirsiniz.</p>
        </div>
    </div>

    <script>
        let selected = { serviceId: '', serviceName: '', price: 0, duration: 0, date: '', time: '' };
        const providerId = '${p.id}';

        function selectService(id, name, price, duration, el) {
            document.querySelectorAll('#servicesList .card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            selected.serviceId = id; selected.serviceName = name;
            selected.price = price; selected.duration = duration;
            updateSummary();
        }

        function selectDate(date, el) {
            document.querySelectorAll('.date-card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            selected.date = date;
            updateSummary();
        }

        function selectTime(time, el) {
            document.querySelectorAll('.time-card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            selected.time = time;
            updateSummary();
        }

        function updateSummary() {
            const summary = document.getElementById('summary');
            if (selected.serviceId && selected.date && selected.time) {
                summary.style.display = 'block';
                document.getElementById('sumService').textContent = '✂️ ' + selected.serviceName;
                document.getElementById('sumDate').textContent = '📅 ' + selected.date;
                document.getElementById('sumTime').textContent = '🕐 ' + selected.time;
                document.getElementById('sumPrice').textContent = '💰 ' + selected.price + ' TL';
            }
        }

        async function submitBooking() {
            const fullName = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const notes = document.getElementById('notes').value.trim();
            const errorEl = document.getElementById('errorMsg');
            errorEl.style.display = 'none';

            if (!fullName || !phone || !email) {
                errorEl.textContent = 'Ad, telefon ve email zorunludur!';
                errorEl.style.display = 'block'; return;
            }
            if (!selected.serviceId || !selected.date || !selected.time) {
                errorEl.textContent = 'Hizmet, tarih ve saat seçin!';
                errorEl.style.display = 'block'; return;
            }

            try {
                let token = '';

                // Önce kayıt dene
                const regRes = await fetch('/api/auth/register/customer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ full_name: fullName, email, phone, password: phone })
                });
                const regData = await regRes.json();
                if (regData.data && regData.data.token) token = regData.data.token;

                // Kayıt başarısızsa giriş dene
                if (!token) {
                    const loginRes = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password: phone })
                    });
                    const loginData = await loginRes.json();
                    if (loginData.data && loginData.data.token) token = loginData.data.token;
                }

                if (!token) {
                    errorEl.textContent = 'Giriş yapılamadı. Bilgilerinizi kontrol edin.';
                    errorEl.style.display = 'block'; return;
                }

                // Randevu oluştur
                const res = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({
                        provider_id: providerId,
                        service_id: selected.serviceId,
                        appointment_date: selected.date,
                        start_time: selected.time,
                        notes: notes || undefined
                    })
                });
                const data = await res.json();

                if (data.success) {
                    document.getElementById('bookingForm').style.display = 'none';
                    document.getElementById('successMsg').style.display = 'block';
                } else {
                    errorEl.textContent = data.message || 'Randevu oluşturulamadı';
                    errorEl.style.display = 'block';
                }
            } catch (error) {
                errorEl.textContent = 'Bağlantı hatası. Tekrar deneyin.';
                errorEl.style.display = 'block';
            }
        }
    </script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        res.status(500).send('<h1>Sunucu hatası</h1>');
    }
});

export default router;