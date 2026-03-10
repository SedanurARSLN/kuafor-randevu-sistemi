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