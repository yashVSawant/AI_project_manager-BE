import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Incoming');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    let requestStartTime: Date = new Date();

    this.logger.log(
      `📡 ${method} ${originalUrl} {time: ${requestStartTime.toISOString()}} ,${req.headers['authorization']}`,
    );

    next();
  }
}
