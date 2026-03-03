export interface Service {
    id: string;
    provider_id: string;
    name: string;
    description?: string;
    duration_min: number;
    price: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateServiceDTO {
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
}

export interface UpdateServiceDTO {
    name?: string;
    description?: string;
    duration_minutes?: number;
    price?: number;
    is_active?: boolean;
}

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