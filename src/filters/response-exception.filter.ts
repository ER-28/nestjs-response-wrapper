import {
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';

import { RESPONSE_WRAPPER_OPTIONS } from '../response-wrapper.module';
import { WrapperOptions } from '../interfaces/wrapper-options.interface';
import { StandardResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(RESPONSE_WRAPPER_OPTIONS) private readonly options: WrapperOptions,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = exception instanceof HttpException 
      ? exception.getResponse() 
      : { message: exception.message };

    const message = typeof errorResponse === 'string' 
      ? errorResponse 
      : (errorResponse as any).message || exception.message;

    const details = typeof errorResponse === 'object' 
      ? (errorResponse as any).details || null 
      : null;

    const standardResponse: StandardResponse = {
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode,
        version: this.options.version,
      },
      error: {
        code: (errorResponse as any).code || 'INTERNAL_SERVER_ERROR',
        message: message,
        details: details,
      },
    };

    if (this.options.debug) {
      standardResponse.meta.stack = exception.stack;
    }

    response.status(statusCode).json(standardResponse);
  }
}
