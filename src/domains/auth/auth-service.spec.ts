import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthEmailService } from 'src/infra/email';
import { User, UsersRepository, UsersService } from '../users';
import { AuthService } from './auth.service';


describe('AuthService', () => {
    let service: AuthService;
    let usersRepository: UsersRepository;
    let userService: UsersService;
    let jwtService: JwtService;
    let emailService: AuthEmailService;

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
                        findByHashedToken: jest.fn(),
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

        service = module.get<AuthService>(AuthService);
        usersRepository = module.get<UsersRepository>(UsersRepository);
        userService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        emailService = module.get<AuthEmailService>(AuthEmailService);
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            const user = { email: 'test@example.com', password: 'password123', name: 'Test User' };
            jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValue(null);
            jest.spyOn(usersRepository, 'create').mockResolvedValue({ id: '1', ...user });

            const result = await service.createUser(user);

            expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(user.email);
            expect(usersRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                ...user,
                password: expect.any(String),
            }));
            expect(result).toEqual({ id: '1', email: 'test@example.com', name: 'Test User' });
        });

        it('should throw ConflictException if email is already in use', async () => {
            const user: User = { id: "1", email: 'test@example.com', password: 'password123', name: 'Test User' };
            jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValue(user);

            await expect(service.createUser(user)).rejects.toThrow(ConflictException);
        });
    });
});
