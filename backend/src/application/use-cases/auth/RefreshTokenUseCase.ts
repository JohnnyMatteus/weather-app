import { z } from 'zod';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { JwtServiceImpl } from '../../../infrastructure/services/JwtService';

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  private readonly jwtService: JwtServiceImpl;

  constructor(
    private readonly userRepository: IUserRepository
  ) {
    this.jwtService = new JwtServiceImpl(
      process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-this-in-production',
      process.env['JWT_REFRESH_SECRET'] || 'your-super-secret-refresh-key-change-this-in-production'
    );
  }

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const decoded = this.jwtService.verifyRefreshToken(request.refreshToken);
      
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = this.jwtService.generateAccessToken(user.id);
      const refreshToken = this.jwtService.generateRefreshToken(user.id);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
