 import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    console.error('❌ Beklenmeyen hata:', err);
    return res.status(500).json({
        success: false,
        message: 'Sunucu hatası oluştu',
    });
};