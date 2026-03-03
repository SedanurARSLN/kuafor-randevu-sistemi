import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { AppError } from '../utils/AppError';

// ─── Token'dan gelen veriyi Request'e ekliyoruz
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

// ─── TOKEN DOĞRULAMA MIDDLEWARE
export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Token bulunamadı. Lütfen giriş yapın', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as {
            userId: string;
            role: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Geçersiz token. Lütfen tekrar giriş yapın', 401));
        }
    }
};

// ─── ROL KONTROLÜ MIDDLEWARE
// Örnek: authorize('provider', 'admin') → sadece kuaför ve admin erişebilir
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new AppError('Önce giriş yapmalısınız', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Bu işlem için yetkiniz yok', 403));
        }

        next();
    };
};