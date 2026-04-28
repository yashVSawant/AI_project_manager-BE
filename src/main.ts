import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingMiddleware } from './core/middlewares/logging.middleware';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { JwtAuthGuard } from './module/auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // ✅ allow all (dev)
    credentials: true,
  });

  // ✅ Middlewares
  app.use(new LoggingMiddleware().use.bind(new LoggingMiddleware()));

  // ✅ Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ✅ Interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
