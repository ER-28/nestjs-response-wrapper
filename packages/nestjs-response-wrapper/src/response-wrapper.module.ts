import { DynamicModule, Global, Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { RESPONSE_WRAPPER_OPTIONS } from "./constants";
import { WrapperOptions } from "./interfaces/wrapper-options.interface";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { ResponseExceptionFilter } from "./filters/response-exception.filter";

@Global()
@Module({})
export class ResponseWrapperModule {
  static forRoot(options: WrapperOptions): DynamicModule {
    return {
      module: ResponseWrapperModule,
      global: true,
      providers: [
        {
          provide: RESPONSE_WRAPPER_OPTIONS,
          useValue: options,
        },
        ResponseInterceptor,
        ResponseExceptionFilter,
        {
          provide: APP_INTERCEPTOR,
          useExisting: ResponseInterceptor,
        },
        {
          provide: APP_FILTER,
          useExisting: ResponseExceptionFilter,
        },
      ],
      exports: [RESPONSE_WRAPPER_OPTIONS],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<WrapperOptions> | WrapperOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: ResponseWrapperModule,
      global: true,
      providers: [
        {
          provide: RESPONSE_WRAPPER_OPTIONS,
          inject: options.inject || [],
          useFactory: options.useFactory,
        },
        ResponseInterceptor,
        ResponseExceptionFilter,
        {
          provide: APP_INTERCEPTOR,
          useExisting: ResponseInterceptor,
        },
        {
          provide: APP_FILTER,
          useExisting: ResponseExceptionFilter,
        },
      ],
      exports: [RESPONSE_WRAPPER_OPTIONS],
    };
  }
}