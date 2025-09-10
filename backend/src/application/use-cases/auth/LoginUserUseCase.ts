import { z } from 'zod';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IEventBus } from '../../../domain/interfaces/services/IEventBus';
import bcrypt from 'bcryptjs';

export const LoginUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginUserRequest = z.infer<typeof LoginUserRequestSchema>;

export interface LoginUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly jwtService: {
      generateAccessToken: (userId: string) => string;
      generateRefreshToken: (userId: string) => string;
    }
  ) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(request.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken(user.id);
    const refreshToken = this.jwtService.generateRefreshToken(user.id);

    // Publish domain event
    await this.eventBus.publish({
      eventType: 'UserLoggedIn',
      aggregateId: user.id,
      payload: { email: user.email },
      timestamp: new Date(),
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }
}
