import { body, ValidationChain } from 'express-validator';

export const createAppointmentValidator: ValidationChain[] = [
    body('provider_id')
        .notEmpty()
        .withMessage('Kuaför seçimi zorunludur'),

    body('service_ids')
        .custom((value, { req }) => {
            if (Array.isArray(value) && value.length > 0) {
                return true;
            }
            if (req.body.service_id) {
                return true;
            }
            throw new Error('En az bir hizmet seçilmeli');
        }),

    body('appointment_date')
        .notEmpty()
        .withMessage('Tarih zorunludur'),

    body('start_time')
        .notEmpty()
        .withMessage('Saat zorunludur'),

    body('notes')
        .optional(),
];

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

    body('full_name')
        .notEmpty()
        .withMessage('Ad soyad zorunludur'),

    body('phone')
        .notEmpty()
        .withMessage('Telefon numarası zorunludur'),

    body('notes')
        .optional(),
];
