import { Test, TestingModule } from '@nestjs/testing';
import { ResponseInterceptor } from '../src/interceptors/response.interceptor';
import { RESPONSE_WRAPPER_OPTIONS } from '../src/response-wrapper.module';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let reflector: Reflector;
  const mockOptions = {
    enableGlobalInterceptor: true,
    includeMeta: true,
    debug: false,
    version: '1.0.0',
    excludeRoutes: ['/health'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RESPONSE_WRAPPER_OPTIONS,
          useValue: mockOptions,
        },
        {
          provide: Reflector,
          useValue: { get: jest.fn() },
        },
        ResponseInterceptor,
      ],
    }).compile();

    interceptor = module.get<ResponseInterceptor>(ResponseInterceptor);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap the response data', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/test' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = {
      handle: () => of({ foo: 'bar' }),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ foo: 'bar' });
      expect(result.meta.path).toBe('/test');
      done();
    });
  });

  it('should skip wrapping if @SkipResponseWrapper is present', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/test' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = {
      handle: () => of({ foo: 'bar' }),
    };

    jest.spyOn(reflector, 'get').mockReturnValue(true);

    interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
      expect(result).toEqual({ foo: 'bar' });
      done();
    });
  });

  it('should skip wrapping if route is in excludeRoutes', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/health' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = {
      handle: () => of({ foo: 'bar' }),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe((result) => {
      expect(result).toEqual({ foo: 'bar' });
      done();
    });
  });
});
