import { Module } from '@nestjs/common';
import { AuthEmailService } from './auth-email.service';

@Module({
  providers: [AuthEmailService],
  exports: [AuthEmailService],
})
export class EmailModule {}
