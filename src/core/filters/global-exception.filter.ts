import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Something went wrong';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }

    // ✅ 🔥 Proper logging BEFORE response
    console.error('----- ERROR START -----');
    console.error('Time:', new Date().toISOString());
    console.error('Method:', request.method);
    console.error('URL:', request.url);
    console.error('Status:', status);

    if (exception instanceof Error) {
      console.error('Message:', exception.message);
      console.error('Stack:', exception.stack);
    } else {
      console.error('Exception:', exception);
    }

    console.error('----- ERROR END -----');

    // ✅ Send response
    response.status(status).json({
      success: false,
      statusCode: status,
      message:
        typeof message === 'string'
          ? message
          : message?.message || 'Something went wrong',
    });
  }
}