// ─── Veritabanındaki Service tablosu tipi
export interface Service {
    id: string;
    provider_id: string;
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

// ─── Hizmet oluştururken gelen veri
export interface CreateServiceDTO {
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
}

// ─── Hizmet güncellerken gelen veri
export interface UpdateServiceDTO {
    name?: string;
    description?: string;
    duration_minutes?: number;
    price?: number;
    is_active?: boolean;
}

// ─── API response
export interface ServiceResponse {
    id: string;
    provider_id: string;
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
    is_active: boolean;
    created_at: Date;
}