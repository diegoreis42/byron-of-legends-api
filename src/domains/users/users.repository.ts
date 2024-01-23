import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { IUser } from './user.interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(user: IUser): Promise<User> {
    return this.userRepository.save(this.userRepository.create(user));
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }
}
