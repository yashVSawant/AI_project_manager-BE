import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.conttroller';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [PassportModule.register({ session: true }),PrismaModule],
  controllers: [AuthController],
  providers:[
    AuthService,
    LocalStrategy, 
  ]
})
export class AuthModule {}