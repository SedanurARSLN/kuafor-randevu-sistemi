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
        .optional()
        .isNumeric()
        .withMessage('Toplam fiyat sayısal olmalıdır'),

    body('notes')
        .optional(),
];