import { User } from '../models/User';

// ─── Dependency Inversion Principle
// Service katmanı bu SOYUT interface'e bağımlı
// Somut PostgreSQL implementasyonuna DEĞİL
// Yarın MongoDB'ye geçsen bile service kodu DEĞİŞMEZ

export interface IUserRepository {
    // Email ile kullanıcı bul
    findByEmail(email: string): Promise<User | null>;

    // ID ile kullanıcı bul
    findById(id: string): Promise<User | null>;

    // Yeni kullanıcı oluştur
    create(
        fullName: string,
        email: string,
        passwordHash: string,
        phone: string | undefined,
        role: string
    ): Promise<User>;

    // Tüm kullanıcıları getir (admin için)
    findAll(): Promise<User[]>;

    // Kullanıcı güncelle
    update(id: string, data: Partial<User>): Promise<User | null>;
}