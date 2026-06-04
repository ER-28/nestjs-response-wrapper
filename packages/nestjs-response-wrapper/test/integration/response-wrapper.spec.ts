import { Controller, Get, INestApplication, Res } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { ResponseExceptionFilter } from "../src/filters/response-exception.filter";
import { ResponseInterceptor } from "../src/interceptors/response.interceptor";
import { ResponseWrapperModule } from "../src/response-wrapper.module";

@Controller("test")
class TestController {
  @Get("success")
  getSuccess() {
    return { message: "Hello World" };
  }

  @Get("paginated")
  getPaginated() {
    return {
      items: [{ id: 1, name: "Item 1" }],
      total: 1,
      limit: 10,
      page: 1,
    };
  }

  @Get("error")
  getError() {
    throw new Error("Internal failure");
  }

  @Get("binary")
  getBinary(@Res() res) {
    res.setHeader("Content-Type", "application/pdf");
    res.send("PDF content");
  }
}

describe("ResponseWrapper Integration", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ResponseWrapperModule.forRoot({
          enableGlobalInterceptor: true,
          includeMeta: true,
          debug: true,
          version: "1.0.0",
          excludeRoutes: [],
        }),
      ],
      controllers: [TestController],
      providers: [
        {
          provide: "RESPONSE_WRAPPER_OPTIONS",
          useValue: { version: "1.0.0", debug: true, excludeRoutes: [] },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(
      new ResponseInterceptor(
        moduleFixture.get("RESPONSE_WRAPPER_OPTIONS"),
        new (require("@nestjs/core").Reflector)(),
      ),
    );
    app.useGlobalFilters(
      new ResponseExceptionFilter(
        moduleFixture.get("RESPONSE_WRAPPER_OPTIONS"),
      ),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should wrap a successful response", async () => {
    const res = await request(app.getHttpServer()).get("/test/success");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: { message: "Hello World" },
      meta: { version: "1.0.0" },
    });
  });

  it("should handle paginated responses", async () => {
    const res = await request(app.getHttpServer()).get("/test/paginated");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: [{ id: 1, name: "Item 1" }],
      meta: {
        pagination: {
          totalItems: 1,
          currentPage: 1,
        },
      },
    });
  });

  it("should wrap exceptions", async () => {
    const res = await request(app.getHttpServer()).get("/test/error");
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  });

  it("should NOT wrap binary responses", async () => {
    const res = await request(app.getHttpServer()).get("/test/binary");
    expect(res.status).toBe(200);
    expect(res.body).toBe("PDF content");
    expect(res.header["content-type"]).toContain("application/pdf");
  });
});
