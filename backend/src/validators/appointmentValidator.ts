import { body, ValidationChain } from 'express-validator';

export const createAppointmentValidator: ValidationChain[] = [
    body('provider_id')
        .notEmpty()
        .withMessage('Kuaför seçimi zorunludur')
        .isUUID()
        .withMessage('Geçersiz kuaför ID'),

    body('service_id')
        .notEmpty()
        .withMessage('Hizmet seçimi zorunludur')
        .isUUID()
        .withMessage('Geçersiz hizmet ID'),

    body('appointment_date')
        .notEmpty()
        .withMessage('Tarih zorunludur')
        .isDate()
        .withMessage('Geçerli bir tarih giriniz (YYYY-MM-DD)'),

    body('start_time')
        .notEmpty()
        .withMessage('Saat zorunludur')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Geçerli bir saat giriniz (HH:MM)'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Not en fazla 500 karakter olabilir'),
];