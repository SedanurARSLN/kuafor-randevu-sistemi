import { Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middlewares/authMiddleware';

// ─── Single Responsibility: SADECE HTTP request/response yönetimi
// ─── İş mantığı YOKTUR burada (hepsi AuthService'de)

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    // POST /api/auth/register/customer
    registerCustomer = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result = await this.authService.registerCustomer(req.body);
            res.status(201).json({
                success: true,
                message: 'Müşteri kaydı başarılı',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /api/auth/register/provider
    registerProvider = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result = await this.authService.registerProvider(req.body);
            res.status(201).json({
                success: true,
                message: 'Kuaför kaydı başarılı',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /api/auth/login
    login = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result = await this.authService.login(req.body);
            res.status(200).json({
                success: true,
                message: 'Giriş başarılı',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/auth/profile
    getProfile = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const result = await this.authService.getProfile(userId);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}