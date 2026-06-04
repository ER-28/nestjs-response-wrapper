import { DynamicModule, Global, Module } from "@nestjs/common";
import { WrapperOptions } from "./interfaces/wrapper-options.interface";

export const RESPONSE_WRAPPER_OPTIONS = "RESPONSE_WRAPPER_OPTIONS";

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
      ],
      exports: [RESPONSE_WRAPPER_OPTIONS],
    };
  }
}
