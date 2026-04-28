import 'dotenv/config';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';

JwtModule.register({
  secret: process.env.SECRET_TOKEN_KEY,
  signOptions: { expiresIn: '1h' },
});

@Module({
  imports: [
    // ✅ Passport WITHOUT session
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // ✅ Proper JWT setup
    JwtModule.register({
      secret: process.env.SECRET_TOKEN_KEY,
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
