import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase } from './RegisterUserUseCase';
import { UserEntity } from '../../../domain/entities/User';

// Mock dependencies
const mockUserRepository = {
  findByEmail: vi.fn(),
  create: vi.fn(),
};

const mockEventBus = {
  publish: vi.fn(),
};

const mockJwtService = {
  generateAccessToken: vi.fn().mockReturnValue('access-token'),
  generateRefreshToken: vi.fn().mockReturnValue('refresh-token'),
};

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RegisterUserUseCase(
      mockUserRepository as any,
      mockEventBus as any,
      mockJwtService as any
    );
  });

  it('should register a new user successfully', async () => {
    const request = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const createdUser = UserEntity.create(request);
    // Mock the id property for testing
    Object.defineProperty(createdUser, 'id', { value: 'user-123', writable: true });

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result = await useCase.execute(request);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(request.email);
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith(createdUser.id);
    expect(mockJwtService.generateRefreshToken).toHaveBeenCalledWith(createdUser.id);
    expect(mockEventBus.publish).toHaveBeenCalledWith({
      eventType: 'UserRegistered',
      aggregateId: createdUser.id,
      payload: { email: request.email, name: request.name },
      timestamp: expect.any(Date),
    });

    expect(result.user.email).toBe(request.email);
    expect(result.user.name).toBe(request.name);
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
  });

  it('should throw error if user already exists', async () => {
    const request = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const existingUser = UserEntity.create(request);
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(request)).rejects.toThrow('User already exists with this email');
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
