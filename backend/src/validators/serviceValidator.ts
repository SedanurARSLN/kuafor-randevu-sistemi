import { body, ValidationChain } from 'express-validator';

// ─── HİZMET EKLEME DOĞRULAMA
export const createServiceValidator: ValidationChain[] = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Hizmet adı zorunludur')
        .isLength({ min: 2, max: 100 })
        .withMessage('Hizmet adı 2-100 karakter arasında olmalıdır'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama en fazla 500 karakter olabilir'),

    body('duration_minutes')
        .notEmpty()
        .withMessage('Hizmet süresi zorunludur')
        .isInt({ min: 5, max: 480 })
        .withMessage('Hizmet süresi 5-480 dakika arasında olmalıdır'),

    body('price')
        .notEmpty()
        .withMessage('Fiyat zorunludur')
        .isFloat({ min: 0 })
        .withMessage('Fiyat 0 dan küçük olamaz'),
];

// ─── HİZMET GÜNCELLEME DOĞRULAMA
export const updateServiceValidator: ValidationChain[] = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Hizmet adı 2-100 karakter arasında olmalıdır'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama en fazla 500 karakter olabilir'),

    body('duration_minutes')
        .optional()
        .isInt({ min: 5, max: 480 })
        .withMessage('Hizmet süresi 5-480 dakika arasında olmalıdır'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Fiyat 0 dan küçük olamaz'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active true veya false olmalıdır'),
];