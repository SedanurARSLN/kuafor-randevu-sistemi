 // ─── Kullanıcı rolleri
export type UserRole = 'customer' | 'provider' | 'admin';

// ─── Veritabanındaki User tablosu tipi
export interface User {
    id: string;
    full_name: string;
    email: string;
    password_hash: string;
    phone?: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
}

// ─── Kayıt olurken gelen veri (müşteri)
export interface RegisterCustomerDTO {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
}

// ─── Kayıt olurken gelen veri (kuaför/provider)
export interface RegisterProviderDTO {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    salon_name?: string;
}

// ─── Giriş yaparken gelen veri
export interface LoginDTO {
    email: string;
    password: string;
}

// ─── API response'da dönen user (şifre HARİÇ!)
export interface UserResponse {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    role: UserRole;
    created_at: Date;
}

// ─── Auth response (token + user bilgisi)
export interface AuthResponse {
    user: UserResponse;
    token: string;
    refreshToken: string;
}