import { Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middlewares/authMiddleware';

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

    // DELETE /api/auth/account
    deleteAccount = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user!.userId;
            await this.authService.deleteAccount(userId);
            res.status(200).json({
                success: true,
                message: 'Hesabiniz basariyla silindi',
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/auth/providers - Tüm kuaförleri listele
    getAllProviders = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const providers = await this.authService.getAllProviders();
            res.status(200).json({
                success: true,
                data: providers,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/auth/providers/:id/services - Kuaförün hizmetlerini getir
    getProviderServices = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.params.id as string;
const services = await this.authService.getProviderServices(id);
            res.status(200).json({
                success: true,
                data: services,
            });
        } catch (error) {
            next(error);
        }
    };
}