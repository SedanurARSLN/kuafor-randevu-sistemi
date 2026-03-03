import { body, ValidationChain } from 'express-validator';

// ─── MÜŞTERI KAYIT DOĞRULAMA
export const registerCustomerValidator: ValidationChain[] = [
    body('full_name')
        .trim()
        .notEmpty()
        .withMessage('Ad soyad zorunludur')
        .isLength({ min: 2, max: 100 })
        .withMessage('Ad soyad 2-100 karakter arasında olmalıdır'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email zorunludur')
        .isEmail()
        .withMessage('Geçerli bir email adresi giriniz')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Şifre zorunludur')
        .isLength({ min: 6 })
        .withMessage('Şifre en az 6 karakter olmalıdır'),

    body('phone')
        .optional()
        .trim()
        .isMobilePhone('tr-TR')
        .withMessage('Geçerli bir telefon numarası giriniz'),
];

// ─── KUAFÖR KAYIT DOĞRULAMA
export const registerProviderValidator: ValidationChain[] = [
    body('full_name')
        .trim()
        .notEmpty()
        .withMessage('Ad soyad zorunludur')
        .isLength({ min: 2, max: 100 })
        .withMessage('Ad soyad 2-100 karakter arasında olmalıdır'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email zorunludur')
        .isEmail()
        .withMessage('Geçerli bir email adresi giriniz')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Şifre zorunludur')
        .isLength({ min: 6 })
        .withMessage('Şifre en az 6 karakter olmalıdır'),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Kuaförler için telefon numarası zorunludur')
        .isMobilePhone('tr-TR')
        .withMessage('Geçerli bir telefon numarası giriniz'),
];

// ─── GİRİŞ DOĞRULAMA
export const loginValidator: ValidationChain[] = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email zorunludur')
        .isEmail()
        .withMessage('Geçerli bir email adresi giriniz')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Şifre zorunludur'),
];