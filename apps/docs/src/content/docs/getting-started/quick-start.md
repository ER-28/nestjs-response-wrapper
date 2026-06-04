---
title: Quick Start
description: Set up nestjs-response-wrapper in under 2 minutes
---

## 1. Register the Module

Import `ResponseWrapperModule.forRoot()` in your root module:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ResponseWrapperModule } from 'nestjs-response-wrapper';

@Module({
  imports: [
    ResponseWrapperModule.forRoot({
      enableGlobalInterceptor: true,
      includeMeta: true,
      debug: false,
      version: '1.0.0',
      excludeRoutes: ['/health'],
    }),
  ],
})
export class AppModule {}
```

That's it. All HTTP responses are now automatically wrapped.

## 2. See It in Action

A controller method like this:

```typescript
@Get('items/:id')
findOne(@Param('id') id: string) {
  return { id, name: 'Item' };
}
```

Will return:

```json
{
  "success": true,
  "data": { "id": "1", "name": "Item" },
  "meta": {
    "timestamp": "2026-01-01T00:00:00.000Z",
    "path": "/items/1",
    "statusCode": 200,
    "version": "1.0.0"
  },
  "error": null
}
```

## 3. Exceptions Are Handled Too

```typescript
@Get('items/:id')
findOne(@Param('id') id: string) {
  throw new NotFoundException('Item not found');
}
```

Returns:

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

## Next Steps

- [Configuration](/guides/configuration/) — Customize the behavior
- [Response Format](/guides/response-format/) — Understand the response envelope
- [Skipping the Wrapper](/guides/skipping-the-wrapper/) — Skip wrapping for specific endpoints
