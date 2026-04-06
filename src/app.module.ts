import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './module/ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './module/auth/auth.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticatedGuard } from './module/auth/guards/session-auth.guard';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true, // 👈 makes env available everywhere
    }),PassportModule.register({ session: true }),PrismaModule,AuthModule,AiModule],
  controllers: [AppController],
  providers: [AppService,{
      provide: APP_GUARD,
      useClass: AuthenticatedGuard, // 👈 This makes it run on EVERY route automatically
    },],
})
export class AppModule {}
