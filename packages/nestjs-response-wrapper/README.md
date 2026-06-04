# nestjs-response-wrapper

A professional response standardization library for NestJS.

[![npm](https://img.shields.io/npm/v/nestjs-response-wrapper)](https://www.npmjs.com/package/nestjs-response-wrapper)
[![license](https://img.shields.io/npm/l/nestjs-response-wrapper)](https://github.com/er28/nestjs-response-wrapper/blob/main/LICENSE)

## Install

```bash
npm install nestjs-response-wrapper
pnpm add nestjs-response-wrapper
yarn add nestjs-response-wrapper
```

## Quick Start

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

All HTTP responses are now automatically wrapped:

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

## Configuration

### Synchronous

```typescript
ResponseWrapperModule.forRoot({
  enableGlobalInterceptor: true,   // Enable the global interceptor
  includeMeta: true,               // Include metadata in responses
  debug: false,                    // Include debug info (stack traces, memory)
  version: '1.0.0',                // API version in every response
  excludeRoutes: ['/health'],      // Routes to skip wrapping
})
```

### Asynchronous

```typescript
ResponseWrapperModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    enableGlobalInterceptor: true,
    includeMeta: true,
    debug: config.get('DEBUG', false),
    version: config.get('VERSION', '1.0.0'),
    excludeRoutes: [],
  }),
  inject: [ConfigService],
})
```

## Features

### Exception Handling

Exceptions are automatically caught and wrapped:

```json
{
  "success": false,
  "data": null,
  "meta": { "statusCode": 404, "..." : "..." },
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Item not found"
  }
}
```

Custom error codes:

```typescript
throw new HttpException(
  { message: 'Email exists', code: 'DUPLICATE_EMAIL' },
  HttpStatus.CONFLICT,
);
```

### Pagination

Auto-detects pagination fields (`total`/`totalItems`/`count`, `limit`/`pageSize`/`itemsPerPage`, `page`/`currentPage`):

```typescript
// Controller returns:
{ items: [...], total: 50, limit: 10, page: 1 }

// Response includes:
"pagination": {
  "totalItems": 50,
  "itemCount": 10,
  "itemsPerPage": 10,
  "totalPages": 5,
  "currentPage": 1
}
```

### Skip Decorator

Skip wrapping for specific handlers:

```typescript
import { SkipResponseWrapper } from 'nestjs-response-wrapper';

@Get('raw')
@SkipResponseWrapper()
getRaw() {
  return 'not wrapped';
}
```

### Binary Passthrough

Binary responses (PDFs, images, audio, video) are automatically passed through without wrapping.

### ResponseService

Injectable service for manual response building:

```typescript
import { ResponseService } from 'nestjs-response-wrapper';

@Injectable()
export class ItemsService {
  constructor(private readonly responseService: ResponseService) {}

  findAll() {
    return this.responseService.wrapSuccess(items, { path: '/items' });
  }
}
```

## API Reference

| Export | Description |
|--------|-------------|
| `ResponseWrapperModule` | Dynamic module (`forRoot`, `forRootAsync`) |
| `ResponseInterceptor` | Global interceptor that wraps responses |
| `ResponseExceptionFilter` | Global exception filter |
| `ResponseService` | Injectable utility service |
| `@SkipResponseWrapper()` | Decorator to skip wrapping |
| `RESPONSE_WRAPPER_OPTIONS` | Injection token for options |
| `WrapperOptions` | Configuration interface |
| `StandardResponse<T>` | Response envelope interface |
| `ResponseMeta` | Metadata interface |
| `ResponseError` | Error interface |
| `PaginationMeta` | Pagination interface |

## License

MIT
