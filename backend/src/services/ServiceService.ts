import { IServiceRepository } from '../interfaces/IServiceRepository';
import { CreateServiceDTO, UpdateServiceDTO, ServiceResponse } from '../models/Service';
import { AppError } from '../utils/AppError';

// ─── SOLID: Single Responsibility — sadece iş mantığı

export class ServiceService {
    private serviceRepository: IServiceRepository;

    constructor(serviceRepository: IServiceRepository) {
        this.serviceRepository = serviceRepository;
    }

    // ─── HİZMET EKLE
    async createService(providerId: string, dto: CreateServiceDTO): Promise<ServiceResponse> {
        // Fiyat ve süre kontrolü
        if (dto.price < 0) {
            throw new AppError('Fiyat 0 dan küçük olamaz', 400);
        }
        if (dto.duration_minutes < 5) {
            throw new AppError('Hizmet süresi en az 5 dakika olmalıdır', 400);
        }

        const service = await this.serviceRepository.create(
            providerId,
            dto.name,
            dto.description,
            dto.duration_minutes,
            dto.price
        );

        return this.toServiceResponse(service);
    }

    // ─── KUAFÖRÜN HİZMETLERİNİ GETİR
    async getProviderServices(providerId: string): Promise<ServiceResponse[]> {
        const services = await this.serviceRepository.findByProviderId(providerId);
        return services.map(this.toServiceResponse);
    }

    // ─── TEK HİZMET GETİR
    async getServiceById(id: string): Promise<ServiceResponse> {
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new AppError('Hizmet bulunamadı', 404);
        }
        return this.toServiceResponse(service);
    }

    // ─── HİZMET GÜNCELLE
    async updateService(
        id: string,
        providerId: string,
        dto: UpdateServiceDTO
    ): Promise<ServiceResponse> {
        // Hizmetin bu kuaföre ait olduğunu kontrol et
        const existing = await this.serviceRepository.findById(id);
        if (!existing) {
            throw new AppError('Hizmet bulunamadı', 404);
        }
        if (existing.provider_id !== providerId) {
            throw new AppError('Bu hizmeti düzenleme yetkiniz yok', 403);
        }

        const updated = await this.serviceRepository.update(id, dto as any);
        if (!updated) {
            throw new AppError('Hizmet güncellenemedi', 500);
        }

        return this.toServiceResponse(updated);
    }

    // ─── HİZMET SİL (soft delete)
    async deleteService(id: string, providerId: string): Promise<void> {
        const existing = await this.serviceRepository.findById(id);
        if (!existing) {
            throw new AppError('Hizmet bulunamadı', 404);
        }
        if (existing.provider_id !== providerId) {
            throw new AppError('Bu hizmeti silme yetkiniz yok', 403);
        }

        await this.serviceRepository.deactivate(id);
    }

    // ─── YARDIMCI
    private toServiceResponse(service: any): ServiceResponse {
        return {
            id: service.id,
            provider_id: service.provider_id,
            name: service.name,
            description: service.description,
            duration_minutes: service.duration_minutes,
            price: parseFloat(service.price),
            is_active: service.is_active,
            created_at: service.created_at,
        };
    }
}