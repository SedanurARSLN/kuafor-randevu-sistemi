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

    // POST /api/auth/forgot-password
    forgotPassword = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.authService.forgotPassword(req.body.email);
            res.status(200).json({
                success: true,
                message: 'Sıfırlama kodu e-posta adresinize gönderildi',
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /api/auth/reset-password
    resetPassword = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { email, code, new_password } = req.body;
            await this.authService.resetPassword(email, code, new_password);
            res.status(200).json({
                success: true,
                message: 'Şifreniz başarıyla güncellendi',
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /api/auth/refresh-token
    refreshToken = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ success: false, message: 'Refresh token gerekli' });
                return;
            }
            const result = await this.authService.refreshAccessToken(refreshToken);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    // PATCH /api/auth/profile
    updateProfile = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const result = await this.authService.updateProfile(userId, req.body);
            res.status(200).json({
                success: true,
                message: 'Profil güncellendi',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // POST /api/auth/push-token — Expo push token kaydet
    savePushToken = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.user!.userId;
            const { token } = req.body;
            if (!token || typeof token !== 'string') {
                res.status(400).json({ success: false, message: 'Geçerli bir token gerekli' });
                return;
            }
            await this.authService.savePushToken(userId, token);
            res.status(200).json({ success: true, message: 'Push token kaydedildi' });
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