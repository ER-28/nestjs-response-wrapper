import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { ResponseWrapperModule } from "../../src/response-wrapper.module";
import { SkipResponseWrapper } from "../../src/decorators/skip-response-wrapper.decorator";

@Controller("test")
class TestController {
  @Get("success")
  getSuccess() {
    return { message: "Hello World" };
  }

  @Get("paginated")
  getPaginated() {
    return {
      items: [{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }],
      total: 50,
      limit: 10,
      page: 1,
    };
  }

  @Get("paginated-data")
  getPaginatedData() {
    return {
      data: [{ id: 1 }],
      totalItems: 30,
      itemsPerPage: 5,
      currentPage: 3,
    };
  }

  @Get("error")
  getError() {
    throw new Error("Internal failure");
  }

  @Get("http-error")
  getHttpError() {
    throw new HttpException("Not found", HttpStatus.NOT_FOUND);
  }

  @Get("validation-error")
  getValidationError() {
    throw new HttpException(
      { message: "Validation failed", details: ["name is required"], code: "VALIDATION" },
      HttpStatus.BAD_REQUEST,
    );
  }

  @Get("unauthorized")
  getUnauthorized() {
    throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
  }

  @Get("forbidden")
  getForbidden() {
    throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
  }

  @Get("conflict")
  getConflict() {
    throw new HttpException("Conflict", HttpStatus.CONFLICT);
  }

  @Get("string-error")
  getStringError() {
    throw new HttpException("Simple string error", HttpStatus.BAD_REQUEST);
  }

  @Get("skip")
  @SkipResponseWrapper()
  getSkip() {
    return { skipped: true };
  }

  @Get("string")
  getString() {
    return "plain string";
  }

  @Get("null")
  getNull() {
    return null;
  }

  @Get("number")
  getNumber() {
    return 42;
  }
}

describe("ResponseWrapper Integration (forRoot)", () => {
  let app: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ResponseWrapperModule.forRoot({
          enableGlobalInterceptor: true,
          includeMeta: true,
          debug: false,
          version: "1.0.0",
          excludeRoutes: ["/health"],
        }),
      ],
      controllers: [TestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Success responses", () => {
    it("should wrap a successful response", async () => {
      const res = await request(app.getHttpServer()).get("/test/success");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: { message: "Hello World" },
        meta: { version: "1.0.0", path: "/test/success", statusCode: 200 },
        error: null,
      });
      expect(res.body.meta.timestamp).toBeDefined();
    });

    it("should handle paginated responses with items", async () => {
      const res = await request(app.getHttpServer()).get("/test/paginated");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ]);
      expect(res.body.meta.pagination).toEqual({
        totalItems: 50,
        itemCount: 10,
        itemsPerPage: 10,
        totalPages: 5,
        currentPage: 1,
      });
    });

    it("should handle paginated responses with data key", async () => {
      const res = await request(app.getHttpServer()).get("/test/paginated-data");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([{ id: 1 }]);
      expect(res.body.meta.pagination).toEqual(
        expect.objectContaining({ totalItems: 30, itemsPerPage: 5, currentPage: 3 }),
      );
    });

    it("should handle string responses", async () => {
      const res = await request(app.getHttpServer()).get("/test/string");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBe("plain string");
    });

    it("should handle null responses", async () => {
      const res = await request(app.getHttpServer()).get("/test/null");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeNull();
    });

    it("should handle number responses", async () => {
      const res = await request(app.getHttpServer()).get("/test/number");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBe(42);
    });
  });

  describe("SkipResponseWrapper decorator", () => {
    it("should not wrap when @SkipResponseWrapper is used", async () => {
      const res = await request(app.getHttpServer()).get("/test/skip");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ skipped: true });
      expect(res.body.success).toBeUndefined();
    });
  });

  describe("Exception handling", () => {
    it("should wrap generic Error as 500", async () => {
      const res = await request(app.getHttpServer()).get("/test/error");
      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        success: false,
        data: null,
        error: { code: "INTERNAL_SERVER_ERROR", message: "Internal failure" },
      });
      expect(res.body.meta.timestamp).toBeDefined();
    });

    it("should wrap HttpException 404", async () => {
      const res = await request(app.getHttpServer()).get("/test/http-error");
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        error: { code: "RESOURCE_NOT_FOUND" },
      });
    });

    it("should wrap validation error with details", async () => {
      const res = await request(app.getHttpServer()).get("/test/validation-error");
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION",
          message: "Validation failed",
          details: ["name is required"],
        },
      });
    });

    it("should handle 401 Unauthorized", async () => {
      const res = await request(app.getHttpServer()).get("/test/unauthorized");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED_ACCESS");
    });

    it("should handle 403 Forbidden", async () => {
      const res = await request(app.getHttpServer()).get("/test/forbidden");
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN_ACCESS");
    });

    it("should handle 409 Conflict", async () => {
      const res = await request(app.getHttpServer()).get("/test/conflict");
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT_ERROR");
    });

    it("should handle string error body", async () => {
      const res = await request(app.getHttpServer()).get("/test/string-error");
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Simple string error");
    });
  });
});

describe("ResponseWrapper Integration (forRootAsync)", () => {
  let app: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ResponseWrapperModule.forRootAsync({
          useFactory: () => ({
            enableGlobalInterceptor: true,
            includeMeta: true,
            debug: false,
            version: "2.0.0",
            excludeRoutes: [],
          }),
        }),
      ],
      controllers: [TestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should wrap response with async config version", async () => {
    const res = await request(app.getHttpServer()).get("/test/success");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: { message: "Hello World" },
    });
    expect(res.body.meta.version).toBe("2.0.0");
  });

  it("should handle exceptions with async config", async () => {
    const res = await request(app.getHttpServer()).get("/test/error");
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      success: false,
      error: { code: "INTERNAL_SERVER_ERROR" },
    });
    expect(res.body.meta.version).toBe("2.0.0");
  });
});
