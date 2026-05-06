import { Module } from '@nestjs/common';
import { ResendEmailService } from './resendEmail.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ResendEmailService],
  exports:[ResendEmailService]
})
export class ResendEmailModule {}