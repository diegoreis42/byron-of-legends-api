import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthEmailService } from 'src/infra/email';
import { UsersRepository, UsersService } from '../users';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let sut: AuthService;
  let usersRepository: UsersRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: AuthEmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get<AuthService>(AuthService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValue(null);
      jest
        .spyOn(usersRepository, 'create')
        .mockResolvedValue({ id: '1', ...user });

      const result = await sut.createUser(user);

      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(user.email);
      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...user,
          password: expect.any(String),
        }),
      );
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw ConflictException if email is already in use', async () => {
      const user = {
        id: '2',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValue(user);

      await expect(sut.createUser(user)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should validate and return user without password if email and password are correct', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
      };
      jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await sut.validateUser('test@example.com', 'password123');

      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should return null if email is incorrect', async () => {
      jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValue(null);

      const result = await sut.validateUser('wrong@example.com', 'password123');

      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(
        'wrong@example.com',
      );
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
      };
      jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await sut.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        user.password,
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const token = 'some-jwt-token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await sut.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        name: user.name,
        email: user.email,
      });
      expect(result).toEqual({ access_token: token });
    });
  });
});
