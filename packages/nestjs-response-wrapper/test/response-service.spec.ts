import { Test, TestingModule } from "@nestjs/testing";
import { RESPONSE_WRAPPER_OPTIONS } from "../src/constants";
import { ResponseService } from "../src/services/response.service";

describe("ResponseService", () => {
  let service: ResponseService;
  const mockOptions = {
    enableGlobalInterceptor: true,
    includeMeta: true,
    debug: false,
    version: "1.0.0",
    excludeRoutes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: RESPONSE_WRAPPER_OPTIONS, useValue: mockOptions },
        ResponseService,
      ],
    }).compile();

    service = module.get<ResponseService>(ResponseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createMeta", () => {
    it("should create meta with timestamp, path, and statusCode", () => {
      const meta = service.createMeta("/test", 200);
      expect(meta).toEqual({
        timestamp: expect.any(String),
        path: "/test",
        statusCode: 200,
        version: "1.0.0",
        pagination: undefined,
      });
    });

    it("should include version from options", () => {
      const meta = service.createMeta("/test", 200);
      expect(meta.version).toBe("1.0.0");
    });

    it("should include pagination when provided", () => {
      const pagination = { totalItems: 100, currentPage: 1 };
      const meta = service.createMeta("/test", 200, pagination);
      expect(meta.pagination).toEqual(pagination);
    });

    it("should have valid ISO timestamp", () => {
      const meta = service.createMeta("/test", 200);
      const timestamp = new Date(meta.timestamp);
      expect(timestamp.toISOString()).toBe(meta.timestamp);
    });

    it("should handle different status codes", () => {
      expect(service.createMeta("/test", 404).statusCode).toBe(404);
      expect(service.createMeta("/test", 500).statusCode).toBe(500);
      expect(service.createMeta("/test", 201).statusCode).toBe(201);
    });
  });

  describe("wrapSuccess", () => {
    it("should create a success response", () => {
      const data = { id: 1, name: "Test" };
      const result = service.wrapSuccess(data);

      expect(result).toEqual({
        success: true,
        data,
        meta: expect.objectContaining({
          timestamp: expect.any(String),
          path: "/unknown",
          statusCode: 200,
          version: "1.0.0",
        }),
        error: null,
      });
    });

    it("should include version from options in meta", () => {
      const result = service.wrapSuccess({});
      expect(result.meta.version).toBe("1.0.0");
    });

    it("should handle null data", () => {
      const result = service.wrapSuccess(null);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle array data", () => {
      const data = [1, 2, 3];
      const result = service.wrapSuccess(data);
      expect(result.data).toEqual([1, 2, 3]);
    });

    it("should allow overriding meta fields", () => {
      const result = service.wrapSuccess({ id: 1 }, { path: "/custom", statusCode: 201 });
      expect(result.meta.path).toBe("/custom");
      expect(result.meta.statusCode).toBe(201);
    });

    it("should allow partial meta override", () => {
      const result = service.wrapSuccess({ id: 1 }, { path: "/override" });
      expect(result.meta.path).toBe("/override");
      expect(result.meta.statusCode).toBe(200);
      expect(result.meta.version).toBe("1.0.0");
    });

    it("should always set error to null on success", () => {
      const result = service.wrapSuccess("data");
      expect(result.error).toBeNull();
    });
  });
});
