import { Response, NextFunction } from 'express';
import { ServiceService } from '../services/ServiceService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class ServiceController {
    private serviceService: ServiceService;

    constructor(serviceService: ServiceService) {
        this.serviceService = serviceService;
    }

    // POST /api/services
    create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const providerId = req.user!.userId;
            const result = await this.serviceService.createService(providerId, req.body);
            res.status(201).json({
                success: true,
                message: 'Hizmet başarıyla eklendi',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/services/my
    getMyServices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const providerId = req.user!.userId;
            const result = await this.serviceService.getProviderServices(providerId);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/services/provider/:providerId
    getProviderServices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const providerId = req.params.providerId as string;
            const result = await this.serviceService.getProviderServices(providerId);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/services/:id
    getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const result = await this.serviceService.getServiceById(id);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/services/:id
    update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const providerId = req.user!.userId;
            const result = await this.serviceService.updateService(id, providerId, req.body);
            res.status(200).json({
                success: true,
                message: 'Hizmet güncellendi',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    // DELETE /api/services/:id
    delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const providerId = req.user!.userId;
            await this.serviceService.deleteService(id, providerId);
            res.status(200).json({
                success: true,
                message: 'Hizmet silindi',
            });
        } catch (error) {
            next(error);
        }
    };
}