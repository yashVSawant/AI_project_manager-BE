import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './module/ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './module/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './module/auth/guards/jwt-auth.guard';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true, 
    }),PassportModule.register({ session: true }),PrismaModule,AuthModule,AiModule],
  controllers: [AppController],
  providers: [AppService,{
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 👈 This makes it run on EVERY route automatically
    },],
})
export class AppModule {}
