import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUser } from './user.interface';
import { User } from './users.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(user: IUser): Promise<User> {
    return this.userRepository.save(this.userRepository.create(user));
  }

  save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
}
