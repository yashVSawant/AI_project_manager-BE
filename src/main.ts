import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingMiddleware } from './core/middlewares/logging.middleware';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import   session from 'express-session';
import passport from 'passport';
import { AuthenticatedGuard } from './module/auth/guards/session-auth.guard';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ 1. Session FIRST
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      },
    }),
  );

  // ✅ 2. Passport AFTER session
  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ 3. Middlewares (logging etc.)
  app.use(new LoggingMiddleware().use.bind(new LoggingMiddleware()));

  // ✅ 4. Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ 5. Global Filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ✅ 6. Global Interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ✅ 7. Global Guards (AFTER everything is ready)
  app.useGlobalGuards(new AuthenticatedGuard(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
