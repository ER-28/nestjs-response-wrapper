import { HttpException, HttpStatus } from "@nestjs/common";
import { ResponseExceptionFilter } from "../src/filters/response-exception.filter";

describe("ResponseExceptionFilter", () => {
  let filter: ResponseExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  const defaultOptions = {
    enableGlobalInterceptor: true,
    includeMeta: true,
    debug: false,
    version: "1.0.0",
    excludeRoutes: [],
  };

  beforeEach(() => {
    filter = new ResponseExceptionFilter(defaultOptions);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = { url: "/test" };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it("should handle HttpException with 400 status", () => {
    const exception = new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "VALIDATION_ERROR",
          message: "Bad request",
        }),
      }),
    );
  });

  it("should handle HttpException with 401 status", () => {
    const exception = new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    filter.catch(exception, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "UNAUTHORIZED_ACCESS" }),
      }),
    );
  });

  it("should handle HttpException with 403 status", () => {
    const exception = new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    filter.catch(exception, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "FORBIDDEN_ACCESS" }),
      }),
    );
  });

  it("should handle HttpException with 404 status", () => {
    const exception = new HttpException("Not found", HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "RESOURCE_NOT_FOUND" }),
      }),
    );
  });

  it("should handle HttpException with 409 status", () => {
    const exception = new HttpException("Conflict", HttpStatus.CONFLICT);
    filter.catch(exception, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "CONFLICT_ERROR" }),
      }),
    );
  });

  it("should handle HttpException with 500 status", () => {
    const exception = new HttpException("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
    filter.catch(exception, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "INTERNAL_SERVER_ERROR" }),
      }),
    );
  });

  it("should handle HttpException with object response body", () => {
    const exception = new HttpException(
      { message: "Validation failed", details: ["field is required"], code: "CUSTOM_CODE" },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "CUSTOM_CODE",
          message: "Validation failed",
          details: ["field is required"],
        }),
      }),
    );
  });

  it("should handle HttpException with string response body", () => {
    const exception = new HttpException("String error", HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ message: "String error" }),
      }),
    );
  });

  it("should handle generic Error (non-HttpException)", () => {
    const exception = new Error("Something went wrong");
    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        }),
      }),
    );
  });

  it("should include stack trace when debug is true", () => {
    const debugFilter = new ResponseExceptionFilter({ ...defaultOptions, debug: true });
    const exception = new Error("Debug error");
    debugFilter.catch(exception, mockHost as any);

    const responseJson = mockResponse.json.mock.calls[0][0];
    expect(responseJson.meta.stack).toBeDefined();
    expect(responseJson.meta.stack).toContain("Error: Debug error");
  });

  it("should not include stack trace when debug is false", () => {
    const exception = new Error("No debug");
    filter.catch(exception, mockHost as any);

    const responseJson = mockResponse.json.mock.calls[0][0];
    expect(responseJson.meta.stack).toBeUndefined();
  });

  it("should include correct meta fields", () => {
    const exception = new HttpException("Not found", HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost as any);

    const responseJson = mockResponse.json.mock.calls[0][0];
    expect(responseJson.meta).toEqual(
      expect.objectContaining({
        timestamp: expect.any(String),
        path: "/test",
        statusCode: 404,
        version: "1.0.0",
      }),
    );
  });

  it("should default to INTERNAL_SERVER_ERROR code for object body without code field", () => {
    const exception = new HttpException(
      { message: "Something" },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, mockHost as any);

    const responseJson = mockResponse.json.mock.calls[0][0];
    expect(responseJson.error.code).toBe("VALIDATION_ERROR");
  });
});
