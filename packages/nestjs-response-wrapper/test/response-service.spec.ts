import { Test, TestingModule } from "@nestjs/testing";
import { ResponseWrapperModule } from "../src/response-wrapper.module";
import { ResponseService } from "../src/services/response.service";

describe("ResponseService", () => {
  let service: ResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ResponseWrapperModule.forRoot({
          enableGlobalInterceptor: true,
          includeMeta: true,
          debug: false,
          version: "1.0.0",
          excludeRoutes: [],
        }),
      ],
      providers: [ResponseService],
    }).compile();

    service = module.get<ResponseService>(ResponseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a standard success response", () => {
    const data = { id: 1, name: "Test" };
    const result = service.wrapSuccess(data);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
    expect(result.error).toBeNull();
    expect(result.meta).toBeDefined();
  });

  it("should include the version in meta", () => {
    const result = service.wrapSuccess({});
    expect(result.meta.version).toBe("1.0.0");
  });
});
