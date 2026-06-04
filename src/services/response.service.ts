import { Injectable, Inject } from '@nestjs/common';
import { RESPONSE_WRAPPER_OPTIONS } from '../response-wrapper.module';
import { WrapperOptions } from '../interfaces/wrapper-options.interface';
import { StandardResponse, ResponseMeta } from '../interfaces/response.interface';

@Injectable()
export class ResponseService {
  constructor(
    @Inject(RESPONSE_WRAPPER_OPTIONS) private readonly options: WrapperOptions,
  ) {}

  createMeta(path: string, statusCode: number, pagination?: any): ResponseMeta {
    return {
      timestamp: new Date().toISOString(),
      path,
      statusCode,
      version: this.options.version,
      pagination,
    };
  }

  wrapSuccess<T>(data: T, meta?: Partial<ResponseMeta>): StandardResponse<T> {
    return {
      success: true,
      data,
      meta: {
        ...this.createMeta('/unknown', 200), // Default, will be overwritten by interceptor usually
        ...meta,
      },
      error: null,
    };
  }
}
