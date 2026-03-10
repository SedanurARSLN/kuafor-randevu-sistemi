import { body, ValidationChain } from 'express-validator';

export const createAppointmentValidator: ValidationChain[] = [
    body('provider_id')
        .notEmpty()
        .withMessage('Kuaför seçimi zorunludur'),

    body('service_ids')
        .isArray({ min: 1 })
        .withMessage('En az bir hizmet seçilmeli'),

    body('appointment_date')
        .notEmpty()
        .withMessage('Tarih zorunludur'),

    body('start_time')
        .notEmpty()
        .withMessage('Saat zorunludur'),

    body('notes')
        .optional(),
];

// Misafir (giriş yapmadan) randevu için doğrulama
export const createPublicAppointmentValidator: ValidationChain[] = [
    body('full_name')
        .notEmpty()
        .withMessage('Ad soyad zorunludur')
        .isLength({ min: 2, max: 100 })
        .withMessage('Ad soyad 2-100 karakter arasında olmalıdır'),

    body('phone')
        .notEmpty()
        .withMessage('Telefon zorunludur')
        .isMobilePhone('tr-TR')
        .withMessage('Geçerli bir telefon numarası giriniz'),

    body('provider_id')
        .notEmpty()
        .withMessage('Kuaför seçimi zorunludur'),

    body('service_ids')
        .isArray({ min: 1 })
        .withMessage('En az bir hizmet seçilmeli'),

    body('appointment_date')
        .notEmpty()
        .withMessage('Tarih zorunludur'),

    body('start_time')
        .notEmpty()
        .withMessage('Saat zorunludur'),

    body('total_price')
        .isNumeric()
        .withMessage('Toplam fiyat sayısal olmalıdır'),

    body('notes')
        .optional(),
];