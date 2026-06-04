import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { WrapperOptions } from './interfaces/wrapper-options.interface';

export const RESPONSE_WRAPPER_OPTIONS = 'RESPONSE_WRAPPER_OPTIONS';

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
      ],
      exports: [RESPONSE_WRAPPER_OPTIONS],
    };
  }

  static forRootAsync(options: any): DynamicModule {
    // Basic implementation of async configuration
    return {
      module: ResponseWrapperModule,
      global: true,
      providers: [
        {
          provide: RESPONSE_WRAPPER_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [RESPONSE_WRAPPER_OPTIONS],
    };
  }
}
