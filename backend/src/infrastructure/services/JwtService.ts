import jwt from 'jsonwebtoken';

export interface JwtService {
  generateAccessToken(userId: string): string;
  generateRefreshToken(userId: string): string;
  verifyToken(token: string): any;
  verifyRefreshToken(token: string): any;
}

export class JwtServiceImpl implements JwtService {
  constructor(
    private readonly accessTokenSecret: string,
    private readonly refreshTokenSecret: string,
    private readonly accessTokenExpiresIn: string = '15m',
    private readonly refreshTokenExpiresIn: string = '7d'
  ) {}

  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn,
    } as jwt.SignOptions);
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.refreshTokenSecret);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
