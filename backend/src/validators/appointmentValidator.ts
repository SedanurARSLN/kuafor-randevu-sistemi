import { body, ValidationChain } from 'express-validator';

export const createAppointmentValidator: ValidationChain[] = [
    body('provider_id')
        .notEmpty()
        .withMessage('Kuaför seçimi zorunludur'),

    body('service_id')
        .optional(),

    body('service_ids')
        .optional(),

    body('appointment_date')
        .notEmpty()
        .withMessage('Tarih zorunludur'),

    body('start_time')
        .notEmpty()
        .withMessage('Saat zorunludur'),

    body('notes')
        .optional(),
];