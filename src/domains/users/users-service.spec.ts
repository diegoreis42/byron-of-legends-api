import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './users.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const email: string = 'test@test.com';
const user: User = {
  id: '1',
  name: 'John Doe',
  email: email,
  password: 'password',
};

const token = 'token';

describe('UsersService', () => {
  let sut: UsersService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findOneByEmail: jest.fn(),
            findOneByHashedToken: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should find a user by email', async () => {
      jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValueOnce(user);

      expect(await sut.findOneByEmail(email)).toEqual(user);
      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw when user is not find', async () => {
      jest.spyOn(usersRepository, 'findOneByEmail').mockResolvedValueOnce(null);
      await expect(sut.findOneByEmail(email)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('findByHashedToken', () => {
    it('should find a user by token', async () => {
      jest
        .spyOn(usersRepository, 'findOneByHashedToken')
        .mockResolvedValueOnce(user);

      expect(await sut.findByHashedToken(token)).toEqual(user);
      expect(usersRepository.findOneByHashedToken).toHaveBeenCalledWith(token);
    });

    it('should throw when user is not find', async () => {
      jest
        .spyOn(usersRepository, 'findOneByHashedToken')
        .mockResolvedValueOnce(null);
      await expect(sut.findByHashedToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersRepository.findOneByHashedToken).toHaveBeenCalledWith(token);
    });
  });
});
