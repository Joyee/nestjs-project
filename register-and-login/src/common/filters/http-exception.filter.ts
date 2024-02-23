import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const status = exception.getStatus();
    const response = ctx.getResponse();

    const message = exception.message
      ? exception.message
      : `${status > 500 ? 'Service Error' : 'Client Error'}`;

    const errorResponse = {
      code: -1,
      data: {},
      message,
    };

    response.header('Content-Type', 'application/json; charset=utf-8');
    response.status(status);
    response.send(errorResponse);
  }
}
