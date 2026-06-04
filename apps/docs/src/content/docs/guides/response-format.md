---
title: Response Format
description: Understand the StandardResponse envelope
---

All responses are wrapped in a `StandardResponse<T>` envelope:

```typescript
interface StandardResponse<T = any> {
  success: boolean;
  data: T | null;
  meta: ResponseMeta;
  error: ResponseError | null;
}
```

## Successful Response

```json
{
  "success": true,
  "data": { "id": 1, "name": "Item" },
  "meta": {
    "timestamp": "2026-01-01T00:00:00.000Z",
    "path": "/items/1",
    "statusCode": 200,
    "version": "1.0.0"
  },
  "error": null
}
```

## Error Response

```json
{
  "success": false,
  "data": null,
  "meta": {
    "timestamp": "2026-01-01T00:00:00.000Z",
    "path": "/items/999",
    "statusCode": 404,
    "version": "1.0.0"
  },
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Item not found"
  }
}
```

## ResponseMeta

Every response includes metadata:

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | `string` | ISO 8601 timestamp |
| `path` | `string` | Request URL path |
| `statusCode` | `number` | HTTP status code |
| `version` | `string` | API version from config |
| `pagination` | `PaginationMeta?` | Present when pagination is detected |
| `debugInfo` | `object?` | Present when `debug: true` |
| `stack` | `string?` | Stack trace on errors when `debug: true` |

## ResponseError

Error details when `success` is `false`:

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Error code (e.g., `VALIDATION_ERROR`, `RESOURCE_NOT_FOUND`) |
| `message` | `string` | Human-readable error message |
| `details` | `any[]?` | Additional error details when provided |

## Debug Mode

When `debug: true`, the interceptor adds `debugInfo` with memory usage:

```json
{
  "meta": {
    "debugInfo": {
      "memoryUsage": {
        "rss": 50000000,
        "heapTotal": 20000000,
        "heapUsed": 15000000
      }
    }
  }
}
```

The exception filter adds `stack` traces to error responses:

```json
{
  "meta": {
    "stack": "Error: Something went wrong\n    at Controller.method (file.ts:10:5)"
  }
}
```
