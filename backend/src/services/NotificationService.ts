import https from 'https';
import pool from '../config/database';

// ─── Expo Push mesaj tipi
interface ExpoMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: 'default';
    badge?: number;
}

// ─── Bildirim şablonları
export const NotificationTemplates = {
    // Kuaföre: yeni randevu geldi
    newAppointment: (customerName: string, date: string, time: string) => ({
        title: '📅 Yeni Randevu',
        body: `${customerName} — ${date} saat ${time} için randevu aldı`,
    }),
    // Müşteriye: randevu onaylandı
    appointmentConfirmed: (providerName: string, date: string, time: string) => ({
        title: '✅ Randevu Onaylandı',
        body: `${providerName} ile ${date} saat ${time} randevunuz onaylandı`,
    }),
    // İlgili tarafa: randevu iptal
    appointmentCancelled: (otherName: string, date: string, time: string) => ({
        title: '❌ Randevu İptal Edildi',
        body: `${otherName} — ${date} saat ${time} randevusu iptal edildi`,
    }),
    // Müşteriye: randevu tamamlandı
    appointmentCompleted: (providerName: string) => ({
        title: '🎉 Randevu Tamamlandı',
        body: `${providerName} ile randevunuz tamamlandı. Tekrar görüşmek üzere!`,
    }),
    // Her iki tarafa: 1 saat öncesi hatırlatma
    reminder: (otherName: string, time: string) => ({
        title: '⏰ Randevu Hatırlatması',
        body: `${otherName} ile saat ${time} randevunuz 1 saat sonra!`,
    }),
};

class NotificationService {

    /**
     * Tek bir token'a push bildirimi gönder
     */
    async send(
        token: string | null | undefined,
        title: string,
        body: string,
        data?: Record<string, unknown>
    ): Promise<void> {
        if (!this.isValidToken(token)) return;
        await this.postToExpo([{ to: token!, title, body, data: data ?? {}, sound: 'default' }]);
    }

    /**
     * Birden fazla token'a aynı bildirimi gönder (batch)
     */
    async sendMulti(
        tokens: (string | null | undefined)[],
        title: string,
        body: string,
        data?: Record<string, unknown>
    ): Promise<void> {
        const valid = tokens.filter(this.isValidToken) as string[];
        if (valid.length === 0) return;
        const messages = valid.map(to => ({ to, title, body, data: data ?? {}, sound: 'default' as const }));
        await this.postToExpo(messages);
    }

    /**
     * Yaklaşan randevular için saatlik hatırlatma gönder.
     * server.ts tarafından her saat başı çağrılır.
     */
    async sendReminders(): Promise<void> {
        try {
            const { rows } = await pool.query(`
                SELECT
                    a.id,
                    TO_CHAR(a.appointment_date, 'DD.MM.YYYY') AS date_str,
                    a.start_time,
                    c.full_name  AS customer_name,
                    c.expo_push_token AS customer_token,
                    p.full_name  AS provider_name,
                    p.expo_push_token AS provider_token
                FROM appointments a
                JOIN users c ON a.customer_id  = c.id
                JOIN users p ON a.provider_id  = p.id
                WHERE a.appointment_date = CURRENT_DATE
                  AND a.start_time BETWEEN
                        (CURRENT_TIME + interval '55 minutes') AND
                        (CURRENT_TIME + interval '70 minutes')
                  AND a.status = 'confirmed'
                  AND a.reminder_sent IS NULL
            `);

            for (const appt of rows) {
                const time = String(appt.start_time).slice(0, 5);

                // Müşteriye
                const customerTpl = NotificationTemplates.reminder(appt.provider_name, time);
                await this.send(appt.customer_token, customerTpl.title, customerTpl.body, {
                    screen: 'Appointments',
                    appointmentId: appt.id,
                });

                // Kuaföre
                const providerTpl = NotificationTemplates.reminder(appt.customer_name, time);
                await this.send(appt.provider_token, providerTpl.title, providerTpl.body, {
                    screen: 'Appointments',
                    appointmentId: appt.id,
                });

                // Tekrar göndermemek için işaretle
                await pool.query(
                    'UPDATE appointments SET reminder_sent = NOW() WHERE id = $1',
                    [appt.id]
                );
            }

            if (rows.length > 0) {
                console.log(`[Push] ${rows.length} hatırlatma bildirimi gönderildi`);
            }
        } catch (err) {
            console.error('[Push] Reminder scheduler hatası:', err);
        }
    }

    // ─── Yardımcılar ──────────────────────────────────────────────────────────

    private isValidToken(token: string | null | undefined): boolean {
        return typeof token === 'string' && token.startsWith('ExponentPushToken[');
    }

    private postToExpo(messages: ExpoMessage[]): Promise<void> {
        const payload = JSON.stringify(messages);

        return new Promise((resolve) => {
            const req = https.request(
                {
                    host: 'exp.host',
                    path: '/--/api/v2/push/send',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Accept-Encoding': 'gzip, deflate',
                        'Content-Length': Buffer.byteLength(payload),
                    },
                },
                (res) => {
                    let raw = '';
                    res.on('data', (chunk) => (raw += chunk));
                    res.on('end', () => {
                        if (res.statusCode && res.statusCode >= 400) {
                            console.warn('[Push] Expo yanıtı:', raw.slice(0, 300));
                        }
                        resolve();
                    });
                }
            );

            req.on('error', (err) => {
                // Bildirim hatası hiçbir zaman işlemi engellemez
                console.error('[Push] HTTP hatası:', err.message);
                resolve();
            });

            req.write(payload);
            req.end();
        });
    }
}

// Singleton — tüm modüller aynı instance'ı kullanır
export const notificationService = new NotificationService();
