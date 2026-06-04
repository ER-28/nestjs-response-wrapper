import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_WRAPPER_OPTIONS } from '../response-wrapper.module';
import { WrapperOptions } from '../interfaces/wrapper-options.interface';
import { ResponseMeta, StandardResponse } from '../interfaces/response.interface';
import { SKIP_RESPONSE_WRAPPER_KEY } from '../decorators/skip-response-wrapper.decorator';
import { isBinaryResponse, formatPagination } from '../utils/response.util';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    @Inject(RESPONSE_WRAPPER_OPTIONS) private readonly options: WrapperOptions,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isSkipped = this.reflector.get<boolean>(
      SKIP_RESPONSE_WRAPPER_KEY,
      context.getHandler(),
    );

    if (isSkipped) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();
    if (isBinaryResponse(response)) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { url } = request;

    if (this.options.excludeRoutes.some((route) => url.includes(route))) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => this.wrapResponse(data, context)),
    );
  }

  private wrapResponse(data: any, context: ExecutionContext): StandardResponse {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;
    const request = context.switchToHttp().getRequest();

    let pagination = null;
    let responseData = data;

    if (data && typeof data === 'object') {
      pagination = formatPagination(data);
      if (pagination) {
        responseData = data.items || data.data || data;
      }
    }

    const meta: ResponseMeta = {
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: statusCode,
      version: this.options.version,
      pagination: pagination,
    };

    if (this.options.debug) {
      meta.debugInfo = {
        memoryUsage: process.memoryUsage(),
      };
    }

    return {
      success: true,
      data: responseData,
      meta,
      error: null,
    };
  }
}


    const request = context.switchToHttp().getRequest();
    const { url } = request;

    if (this.options.excludeRoutes.some((route) => url.includes(route))) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => this.wrapResponse(data, context)),
    );
  }

  private wrapResponse(data: any, context: ExecutionContext): StandardResponse {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;
    const request = context.switchToHttp().getRequest();

    const meta: ResponseMeta = {
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: statusCode,
      version: this.options.version,
    };

    if (this.options.debug) {
      meta.debugInfo = {
        memoryUsage: process.memoryUsage(),
      };
    }

    return {
      success: true,
      data,
      meta,
      error: null,
    };
  }
}
