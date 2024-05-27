import { Module } from '@nestjs/common';
import { AuthModule } from './auth';
import { UsersModule } from './users';

@Module({
  imports: [AuthModule, UsersModule],
})
export class DomainsModule { }
