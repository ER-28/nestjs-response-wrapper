import { formatPagination, isBinaryResponse } from "../src/utils/response.util";

describe("formatPagination", () => {
  it("should return null for null input", () => {
    expect(formatPagination(null)).toBeNull();
  });

  it("should return null for undefined input", () => {
    expect(formatPagination(undefined)).toBeNull();
  });

  it("should return null for non-object input", () => {
    expect(formatPagination("string")).toBeNull();
    expect(formatPagination(123)).toBeNull();
    expect(formatPagination(true)).toBeNull();
  });

  it("should return null when total is missing", () => {
    expect(formatPagination({ limit: 10, page: 1 })).toBeNull();
  });

  it("should return null when limit is missing", () => {
    expect(formatPagination({ total: 100, page: 1 })).toBeNull();
  });

  it("should format pagination with total and limit", () => {
    const result = formatPagination({ total: 100, limit: 10, page: 1 });
    expect(result).toEqual({
      totalItems: 100,
      itemCount: 10,
      itemsPerPage: 10,
      totalPages: 10,
      currentPage: 1,
    });
  });

  it("should use totalItems as alias for total", () => {
    const result = formatPagination({ totalItems: 50, limit: 10, page: 2 });
    expect(result?.totalItems).toBe(50);
  });

  it("should use count as alias for total", () => {
    const result = formatPagination({ count: 30, limit: 10 });
    expect(result?.totalItems).toBe(30);
  });

  it("should use pageSize as alias for limit", () => {
    const result = formatPagination({ total: 100, pageSize: 20 });
    expect(result?.itemsPerPage).toBe(20);
  });

  it("should use itemsPerPage as alias for limit", () => {
    const result = formatPagination({ total: 100, itemsPerPage: 25 });
    expect(result?.itemsPerPage).toBe(25);
  });

  it("should default page to 1 when not provided", () => {
    const result = formatPagination({ total: 100, limit: 10 });
    expect(result?.currentPage).toBe(1);
  });

  it("should use currentPage as alias for page", () => {
    const result = formatPagination({ total: 100, limit: 10, currentPage: 5 });
    expect(result?.currentPage).toBe(5);
  });

  it("should calculate totalPages correctly with exact division", () => {
    const result = formatPagination({ total: 100, limit: 10 });
    expect(result?.totalPages).toBe(10);
  });

  it("should calculate totalPages correctly with remainder", () => {
    const result = formatPagination({ total: 105, limit: 10 });
    expect(result?.totalPages).toBe(11);
  });

  it("should use count for itemCount when available", () => {
    const result = formatPagination({ total: 100, limit: 10, count: 5 });
    expect(result?.itemCount).toBe(5);
  });

  it("should fall back to limit for itemCount when count is not available", () => {
    const result = formatPagination({ total: 100, limit: 10 });
    expect(result?.itemCount).toBe(10);
  });
});

describe("isBinaryResponse", () => {
  it("should return false when no content-type header", () => {
    const response = { getHeader: () => undefined };
    expect(isBinaryResponse(response)).toBe(false);
  });

  it("should return false when content-type is null", () => {
    const response = { getHeader: () => null };
    expect(isBinaryResponse(response)).toBe(false);
  });

  it("should return true for application/octet-stream", () => {
    const response = { getHeader: () => "application/octet-stream" };
    expect(isBinaryResponse(response)).toBe(true);
  });

  it("should return true for application/pdf", () => {
    const response = { getHeader: () => "application/pdf" };
    expect(isBinaryResponse(response)).toBe(true);
  });

  it("should return true for application/zip", () => {
    const response = { getHeader: () => "application/zip" };
    expect(isBinaryResponse(response)).toBe(true);
  });

  it("should return true for image/png", () => {
    const response = { getHeader: () => "image/png" };
    expect(isBinaryResponse(response)).toBe(true);
  });

  it("should return true for image/jpeg", () => {
    const response = { getHeader: () => "image/jpeg" };
    expect(isBinaryResponse(response)).toBe(true);
  });

  it("should return true for video/mp4", () => {
    const response = { getHeader: () => "video/mp4" };
    expect(isBinaryResponse(response)).toBe(true);
  });

  it("should return true for audio/mpeg", () => {
    const response = { getHeader: () => "audio/mpeg" };
    expect(isBinaryResponse(response)).toBe(true);
  });

  it("should return false for application/json", () => {
    const response = { getHeader: () => "application/json" };
    expect(isBinaryResponse(response)).toBe(false);
  });

  it("should return false for text/html", () => {
    const response = { getHeader: () => "text/html" };
    expect(isBinaryResponse(response)).toBe(false);
  });

  it("should return false for text/plain", () => {
    const response = { getHeader: () => "text/plain" };
    expect(isBinaryResponse(response)).toBe(false);
  });

  it("should handle content-type with charset", () => {
    const response = {
      getHeader: () => "application/pdf; charset=utf-8",
    };
    expect(isBinaryResponse(response)).toBe(true);
  });
});
