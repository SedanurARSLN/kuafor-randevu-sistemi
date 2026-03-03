import { Service } from '../models/Service';

// ─── SOLID: Dependency Inversion
export interface IServiceRepository {
    // Hizmet oluştur
    create(
        providerId: string,
        name: string,
        description: string | undefined,
        durationMinutes: number,
        price: number
    ): Promise<Service>;

    // Kuaförün tüm hizmetlerini getir
    findByProviderId(providerId: string): Promise<Service[]>;

    // Tek hizmet getir
    findById(id: string): Promise<Service | null>;

    // Hizmet güncelle
    update(id: string, data: Partial<Service>): Promise<Service | null>;

    // Hizmet sil (soft delete — is_active = false)
    deactivate(id: string): Promise<Service | null>;
}