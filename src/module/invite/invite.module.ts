import { Module } from '@nestjs/common';
import { ResendEmailModule } from '../resend-email/resendEmail.module';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';

@Module({
  imports: [ResendEmailModule],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}