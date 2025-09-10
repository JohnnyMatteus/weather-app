import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { PostgresUserRepository } from '../../../infrastructure/database/PostgresUserRepository';
import { DatabaseConnection } from '../../../infrastructure/database/DatabaseConnection';
import { RabbitMQEventBus } from '../../../infrastructure/messaging/RabbitMQEventBus';
import { JwtServiceImpl } from '../../../infrastructure/services/JwtService';
import { userRegistrations, userLogins } from '../../../infrastructure/monitoring/MetricsService';

export class AuthController {
  private registerUserUseCase!: RegisterUserUseCase;
  private loginUserUseCase!: LoginUserUseCase;
  private refreshTokenUseCase!: RefreshTokenUseCase;

  constructor() {
    // Use cases will be initialized lazily when needed
  }

  private async initializeUseCases() {
    if (!this.registerUserUseCase || !this.loginUserUseCase || !this.refreshTokenUseCase) {
      const userRepository = new PostgresUserRepository();
      const eventBus = new RabbitMQEventBus(process.env['RABBITMQ_URL'] || 'amqp://localhost:5672');
      await eventBus.connect();
      
      const jwtService = new JwtServiceImpl(
        process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-this-in-production',
        process.env['JWT_REFRESH_SECRET'] || 'your-super-secret-refresh-key-change-this-in-production'
      );
      
      this.registerUserUseCase = new RegisterUserUseCase(userRepository, eventBus, jwtService);
      this.loginUserUseCase = new LoginUserUseCase(userRepository, eventBus, jwtService);
      this.refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      await this.initializeUseCases();
      const result = await this.registerUserUseCase.execute(req.body);
      
      // Increment registration metric
      userRegistrations.inc();
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        res.status(409).json({
          success: false,
          error: error.message,
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      await this.initializeUseCases();
      const result = await this.loginUserUseCase.execute(req.body);
      
      // Increment login metric
      userLogins.inc();
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      await this.initializeUseCases();
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      const db = DatabaseConnection.getPool();
      const { rows } = await db.query('SELECT id, email, name FROM users WHERE id = $1 LIMIT 1', [userId]);
      if (!rows[0]) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, data: { user: rows[0] } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      await this.initializeUseCases();
      const { refreshToken } = req.body;
      const result = await this.refreshTokenUseCase.execute({ refreshToken });
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }
}