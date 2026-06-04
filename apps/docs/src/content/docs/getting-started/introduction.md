---
title: Introduction
description: What is nestjs-response-wrapper and why use it
---

`nestjs-response-wrapper` is a NestJS library that standardizes your API responses into a consistent format. It automatically wraps successful responses and exceptions into a `StandardResponse` envelope, so your clients always receive the same structure.

## The Problem

Without response standardization, your API might return different shapes depending on the controller:

```json
// Success
{ "id": 1, "name": "Item" }

// Error
{ "statusCode": 404, "message": "Not found" }

// Paginated
{ "items": [...], "total": 100, "page": 1 }
```

## The Solution

With `nestjs-response-wrapper`, every response follows one consistent format:

```json
// Success
{
  "success": true,
  "data": { "id": 1, "name": "Item" },
  "meta": { "timestamp": "...", "path": "/items/1", "statusCode": 200, "version": "1.0.0" },
  "error": null
}

// Error
{
  "success": false,
  "data": null,
  "meta": { "timestamp": "...", "path": "/items/999", "statusCode": 404, "version": "1.0.0" },
  "error": { "code": "RESOURCE_NOT_FOUND", "message": "Not found" }
}

// Paginated
{
  "success": true,
  "data": [{ "id": 1, "name": "Item" }],
  "meta": {
    "timestamp": "...",
    "path": "/items",
    "statusCode": 200,
    "version": "1.0.0",
    "pagination": { "totalItems": 100, "itemsPerPage": 10, "currentPage": 1, "totalPages": 10, "itemCount": 10 }
  },
  "error": null
}
```

## Key Features

- **Automatic wrapping** — All responses are wrapped via a global interceptor
- **Exception handling** — Errors are caught and formatted into a consistent error shape
- **Pagination detection** — Auto-detects pagination fields (`total`, `limit`, `page`, etc.)
- **Binary passthrough** — Skips wrapping for binary content types (PDFs, images, etc.)
- **Skip decorator** — Skip wrapping for specific handlers with `@SkipResponseWrapper()`
- **Route exclusion** — Exclude specific routes from wrapping
- **Async configuration** — Load config asynchronously (e.g., from a database or config service)
- **Debug mode** — Include stack traces and memory usage in responses during development
