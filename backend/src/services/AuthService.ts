import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { IUserRepository } from '../interfaces/IUserRepository';
import {
    RegisterCustomerDTO,
    RegisterProviderDTO,
    LoginDTO,
    AuthResponse,
    UserResponse,
} from '../models/User';
import { AppError } from '../utils/AppError';

// ─── Single Responsibility: SADECE iş mantığı (auth logic)
// ─── Dependency Inversion: IUserRepository'e bağımlı (soyut), UserRepository'e DEĞİL

export class AuthService {
    private userRepository: IUserRepository;

    // Constructor Injection — SOLID: D prensibi
    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    // ─── MÜŞTERI KAYIT
    async registerCustomer(dto: RegisterCustomerDTO): Promise<AuthResponse> {
        // 1. Email kontrolü
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new AppError('Bu email zaten kayıtlı', 400);
        }

        // 2. Şifreyi hashle
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // 3. Kullanıcı oluştur
        const user = await this.userRepository.create(
            dto.full_name,
            dto.email,
            passwordHash,
            dto.phone,
            'customer'
        );

        // 4. Token oluştur
        const token = this.generateToken(user.id, user.role);

        // 5. Response döndür (şifre HARİÇ)
        return {
            user: this.toUserResponse(user),
            token,
        };
    }

    // ─── KUAFÖR (PROVIDER) KAYIT
    async registerProvider(dto: RegisterProviderDTO): Promise<AuthResponse> {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new AppError('Bu email zaten kayıtlı', 400);
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.userRepository.create(
            dto.full_name,
            dto.email,
            passwordHash,
            dto.phone,
            'provider'
        );

        const token = this.generateToken(user.id, user.role);

        return {
            user: this.toUserResponse(user),
            token,
        };
    }

    // ─── GİRİŞ
    async login(dto: LoginDTO): Promise<AuthResponse> {
        // 1. Kullanıcıyı bul
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new AppError('Email veya şifre hatalı', 401);
        }

        // 2. Şifreyi kontrol et
        const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
        if (!isPasswordValid) {
            throw new AppError('Email veya şifre hatalı', 401);
        }

        // 3. Token oluştur
        const token = this.generateToken(user.id, user.role);

        return {
            user: this.toUserResponse(user),
            token,
        };
    }

    // ─── PROFİL GÖRÜNTÜLE
    async getProfile(userId: string): Promise<UserResponse> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }
        return this.toUserResponse(user);
    }

        // ─── YARDIMCI: JWT Token oluştur
    private generateToken(userId: string, role: string): string {
        const payload = { userId, role };
        const secret = config.jwtSecret;
        const expiresIn = config.jwtExpiresIn as string;

        return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
    }

    // ─── YARDIMCI: User → UserResponse (şifre hariç)
    private toUserResponse(user: any): UserResponse {
        return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at,
        };
    }
}