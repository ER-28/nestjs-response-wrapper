import { CallHandler, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";
import { ResponseInterceptor } from "../src/interceptors/response.interceptor";
import { RESPONSE_WRAPPER_OPTIONS } from "../src/constants";

function createMockContext(url: string, statusCode = 200, contentType?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ url }),
      getResponse: () => ({
        statusCode,
        getHeader: (name: string) => (name === "content-type" ? contentType : undefined),
      }),
    }),
    getHandler: () => ({}),
  } as unknown as ExecutionContext;
}

const defaultOptions = {
  enableGlobalInterceptor: true,
  includeMeta: true,
  debug: false,
  version: "1.0.0",
  excludeRoutes: ["/health"],
};

describe("ResponseInterceptor", () => {
  let interceptor: ResponseInterceptor;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: RESPONSE_WRAPPER_OPTIONS, useValue: defaultOptions },
        { provide: Reflector, useValue: { get: jest.fn() } },
        ResponseInterceptor,
      ],
    }).compile();

    interceptor = module.get<ResponseInterceptor>(ResponseInterceptor);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should wrap the response data in StandardResponse format", (done) => {
    const context = createMockContext("/test");
    const handler: CallHandler = { handle: () => of({ foo: "bar" }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: { foo: "bar" },
        meta: expect.objectContaining({
          timestamp: expect.any(String),
          path: "/test",
          statusCode: 200,
          version: "1.0.0",
        }),
        error: null,
      });
      done();
    });
  });

  it("should skip wrapping if @SkipResponseWrapper is present", (done) => {
    jest.spyOn(reflector, "get").mockReturnValue(true);
    const context = createMockContext("/test");
    const handler: CallHandler = { handle: () => of({ foo: "bar" }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({ foo: "bar" });
      done();
    });
  });

  it("should skip wrapping if route is in excludeRoutes", (done) => {
    const context = createMockContext("/health");
    const handler: CallHandler = { handle: () => of({ foo: "bar" }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({ foo: "bar" });
      done();
    });
  });

  it("should skip wrapping for binary responses", (done) => {
    const context = createMockContext("/file", 200, "application/pdf");
    const handler: CallHandler = { handle: () => of("PDF content") };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toBe("PDF content");
      done();
    });
  });

  it("should skip wrapping for image responses", (done) => {
    const context = createMockContext("/image", 200, "image/png");
    const handler: CallHandler = { handle: () => of(Buffer.from("image")) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual(Buffer.from("image"));
      done();
    });
  });

  it("should extract pagination from response data with total/limit/page", (done) => {
    const context = createMockContext("/list");
    const handler: CallHandler = {
      handle: () =>
        of({
          items: [{ id: 1 }, { id: 2 }],
          total: 50,
          limit: 10,
          page: 2,
        }),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result.meta.pagination).toEqual({
        totalItems: 50,
        itemCount: 10,
        itemsPerPage: 10,
        totalPages: 5,
        currentPage: 2,
      });
      done();
    });
  });

  it("should extract pagination with totalItems/itemsPerPage/currentPage aliases", (done) => {
    const context = createMockContext("/list");
    const handler: CallHandler = {
      handle: () =>
        of({
          data: [{ id: 1 }],
          totalItems: 30,
          itemsPerPage: 5,
          currentPage: 3,
        }),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.data).toEqual([{ id: 1 }]);
      expect(result.meta.pagination).toEqual(
        expect.objectContaining({ totalItems: 30, itemsPerPage: 5, currentPage: 3 }),
      );
      done();
    });
  });

  it("should use raw data when no pagination fields are present", (done) => {
    const context = createMockContext("/detail");
    const handler: CallHandler = {
      handle: () => of({ id: 1, name: "Test" }),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.data).toEqual({ id: 1, name: "Test" });
      expect(result.meta.pagination).toBeNull();
      done();
    });
  });

  it("should pass through string data unchanged", (done) => {
    const context = createMockContext("/text");
    const handler: CallHandler = { handle: () => of("hello") };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toBe("hello");
      done();
    });
  });

  it("should pass through null data unchanged", (done) => {
    const context = createMockContext("/null");
    const handler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      done();
    });
  });

  it("should include debugInfo when debug is true", (done) => {
    const debugOptions = { ...defaultOptions, debug: true };
    const module$ = Test.createTestingModule({
      providers: [
        { provide: RESPONSE_WRAPPER_OPTIONS, useValue: debugOptions },
        { provide: Reflector, useValue: { get: jest.fn() } },
        ResponseInterceptor,
      ],
    });

    module$.compile().then((mod) => {
      const debugInterceptor = mod.get<ResponseInterceptor>(ResponseInterceptor);
      const context = createMockContext("/debug");
      const handler: CallHandler = { handle: () => of({ ok: true }) };

      debugInterceptor.intercept(context, handler).subscribe((result) => {
        expect(result.meta.debugInfo).toBeDefined();
        expect(result.meta.debugInfo.memoryUsage).toBeDefined();
        done();
      });
    });
  });

  it("should not include debugInfo when debug is false", (done) => {
    const context = createMockContext("/no-debug");
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.meta.debugInfo).toBeUndefined();
      done();
    });
  });

  it("should include version in meta", (done) => {
    const context = createMockContext("/version");
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.meta.version).toBe("1.0.0");
      done();
    });
  });

  it("should include correct statusCode from response", (done) => {
    const context = createMockContext("/created", 201);
    const handler: CallHandler = { handle: () => of({ created: true }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.meta.statusCode).toBe(201);
      done();
    });
  });

  it("should not wrap when @SkipResponseWrapper returns false", (done) => {
    jest.spyOn(reflector, "get").mockReturnValue(false);
    const context = createMockContext("/test");
    const handler: CallHandler = { handle: () => of({ foo: "bar" }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ foo: "bar" });
      done();
    });
  });

  it("should not wrap when reflector returns undefined", (done) => {
    jest.spyOn(reflector, "get").mockReturnValue(undefined);
    const context = createMockContext("/test");
    const handler: CallHandler = { handle: () => of({ foo: "bar" }) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      done();
    });
  });

  it("should handle empty excludeRoutes array", (done) => {
    const noExcludeOptions = { ...defaultOptions, excludeRoutes: [] };
    const module$ = Test.createTestingModule({
      providers: [
        { provide: RESPONSE_WRAPPER_OPTIONS, useValue: noExcludeOptions },
        { provide: Reflector, useValue: { get: jest.fn() } },
        ResponseInterceptor,
      ],
    });

    module$.compile().then((mod) => {
      const noExcludeInterceptor = mod.get<ResponseInterceptor>(ResponseInterceptor);
      const context = createMockContext("/anything");
      const handler: CallHandler = { handle: () => of({ data: 1 }) };

      noExcludeInterceptor.intercept(context, handler).subscribe((result) => {
        expect(result.success).toBe(true);
        done();
      });
    });
  });
});
