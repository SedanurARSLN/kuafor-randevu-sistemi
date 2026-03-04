import { User } from '../models/User';

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(fullName: string, email: string, passwordHash: string, phone: string | undefined, role: string): Promise<User>;
    findAll(): Promise<User[]>;
    findByRole(role: string): Promise<User[]>;
    getProviderServices(providerId: string): Promise<any[]>;
    update(id: string, data: Partial<User>): Promise<User | null>;
}