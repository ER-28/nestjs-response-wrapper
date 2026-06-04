---
title: Interfaces
description: TypeScript interfaces for nestjs-response-wrapper
---

## `WrapperOptions`

Configuration options for the library.

```typescript
interface WrapperOptions {
  enableGlobalInterceptor: boolean;
  includeMeta: boolean;
  debug: boolean;
  version: string;
  excludeRoutes: string[];
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enableGlobalInterceptor` | `boolean` | — | Enable/disable the global response interceptor |
| `includeMeta` | `boolean` | — | Include metadata in responses |
| `debug` | `boolean` | — | Include debug info (stack traces on errors, memory usage) |
| `version` | `string` | — | API version string included in every response |
| `excludeRoutes` | `string[]` | `[]` | Routes to skip wrapping (matched via `String.includes()`) |

---

## `StandardResponse<T>`

The standard response envelope returned by the interceptor and filter.

```typescript
interface StandardResponse<T = any> {
  success: boolean;
  data: T | null;
  meta: ResponseMeta;
  error: ResponseError | null;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | `true` for successful responses, `false` for errors |
| `data` | `T \| null` | The response data, or `null` on errors |
| `meta` | `ResponseMeta` | Response metadata |
| `error` | `ResponseError \| null` | Error details, or `null` on success |

---

## `ResponseMeta`

Metadata included in every response.

```typescript
interface ResponseMeta {
  timestamp: string;
  path: string;
  statusCode: number;
  version?: string;
  pagination?: PaginationMeta;
  debugInfo?: any;
  stack?: string;
  [key: string]: any;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | `string` | ISO 8601 timestamp |
| `path` | `string` | Request URL path |
| `statusCode` | `number` | HTTP status code |
| `version` | `string` | API version from config |
| `pagination` | `PaginationMeta` | Pagination info (when detected) |
| `debugInfo` | `any` | Debug info when `debug: true` (interceptor) |
| `stack` | `string` | Stack trace when `debug: true` (exception filter) |

---

## `ResponseError`

Error details in error responses.

```typescript
interface ResponseError {
  code: string;
  message: string;
  details?: any[];
}
```

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | Error code (e.g., `VALIDATION_ERROR`) |
| `message` | `string` | Human-readable error message |
| `details` | `any[]` | Additional error details |

---

## `PaginationMeta`

Pagination metadata auto-detected from response data.

```typescript
interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `totalItems` | `number` | Total number of items across all pages |
| `itemCount` | `number` | Number of items in the current page |
| `itemsPerPage` | `number` | Maximum items per page |
| `totalPages` | `number` | Total number of pages |
| `currentPage` | `number` | Current page number (1-based) |
