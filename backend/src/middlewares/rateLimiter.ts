import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Çok fazla istek gönderdiniz, lütfen bir dakika sonra tekrar deneyin',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const publicAppointmentLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Çok fazla randevu isteği, lütfen bir dakika sonra tekrar deneyin',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
