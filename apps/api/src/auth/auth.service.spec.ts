import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'test@test.com' });

    const result = await service.register('test@test.com', 'password123');
    expect(result.access_token).toBe('mock_token');
  });

  it('should throw ConflictException if email exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(service.register('exists@test.com', 'pass')).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@test.com',
      passwordHash: '$2b$12$invalid_hash',
    });
    await expect(service.login('test@test.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for unknown email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login('nouser@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
  });
});
