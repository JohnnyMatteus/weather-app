import { z } from 'zod';
import { UserEntity, User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IEventBus } from '../../../domain/interfaces/services/IEventBus';
import bcrypt from 'bcryptjs';

export const RegisterUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;

export interface RegisterUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly jwtService: {
      generateAccessToken: (userId: string) => string;
      generateRefreshToken: (userId: string) => string;
    }
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(request.password, 12);

    // Create user entity
    const user = UserEntity.create({
      email: request.email,
      password: hashedPassword,
      name: request.name,
    });

    // Save user
    const savedUser = await this.userRepository.create(user);

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken(savedUser.id);
    const refreshToken = this.jwtService.generateRefreshToken(savedUser.id);

    // Publish domain event
    await this.eventBus.publish({
      eventType: 'UserRegistered',
      aggregateId: savedUser.id,
      payload: { email: savedUser.email, name: savedUser.name },
      timestamp: new Date(),
    });

    const userData = savedUser.toJSON();
    
    // Convert dates to strings to avoid serialization issues
    const serializedUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt.toISOString(),
      updatedAt: userData.updatedAt.toISOString(),
    };
    
    return {
      user: serializedUser,
      accessToken,
      refreshToken,
    };
  }
}
