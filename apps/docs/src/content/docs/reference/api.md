---
title: API Reference
description: Complete API reference for nestjs-response-wrapper
---

## Exports

All exports are available from the main package entry point:

```typescript
import {
  ResponseWrapperModule,
  ResponseInterceptor,
  ResponseExceptionFilter,
  ResponseService,
  SkipResponseWrapper,
  RESPONSE_WRAPPER_OPTIONS,
  SKIP_RESPONSE_WRAPPER_KEY,
} from 'nestjs-response-wrapper';
```

---

## `ResponseWrapperModule`

NestJS `DynamicModule`. Register once in your root module.

### `forRoot(options: WrapperOptions): DynamicModule`

Synchronous registration.

```typescript
ResponseWrapperModule.forRoot({
  enableGlobalInterceptor: true,
  includeMeta: true,
  debug: false,
  version: '1.0.0',
  excludeRoutes: ['/health'],
})
```

### `forRootAsync(options): DynamicModule`

Asynchronous registration with factory function.

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

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.useFactory` | `(...args: any[]) => Promise<WrapperOptions> \| WrapperOptions` | Factory function that returns options |
| `options.inject` | `any[]` | Dependencies to inject into the factory |

---

## `ResponseInterceptor`

Global `NestInterceptor` that wraps responses.

Automatically registered via `ResponseWrapperModule`. Also available for manual registration:

```typescript
app.useGlobalInterceptors(
  new ResponseInterceptor(options, new Reflector()),
);
```

### Behavior

1. Checks for `@SkipResponseWrapper()` metadata — skips if present
2. Checks if response is binary (PDF, images, etc.) — skips if true
3. Checks if URL matches `excludeRoutes` — skips if matched
4. Otherwise wraps the response in `StandardResponse<T>`

---

## `ResponseExceptionFilter`

Global `ExceptionFilter` that formats exceptions into `StandardResponse` error shape.

Automatically registered via `ResponseWrapperModule`. Also available for manual registration:

```typescript
app.useGlobalFilters(new ResponseExceptionFilter(options));
```

### Error Code Mapping

| HTTP Status | Error Code |
|-------------|------------|
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHORIZED_ACCESS` |
| 403 | `FORBIDDEN_ACCESS` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `CONFLICT_ERROR` |
| 500 | `INTERNAL_SERVER_ERROR` |

Custom `code` in exception response body takes precedence.

---

## `ResponseService`

Injectable service with response-building utilities.

### `createMeta(path: string, statusCode: number, pagination?: any): ResponseMeta`

Creates a metadata object.

### `wrapSuccess<T>(data: T, meta?: Partial<ResponseMeta>): StandardResponse<T>`

Wraps data in a success response envelope.

---

## `@SkipResponseWrapper()`

Decorator that bypasses the response wrapper for a controller method.

```typescript
@SkipResponseWrapper()
@Get('raw')
getRaw() {
  return 'not wrapped';
}
```

---

## `RESPONSE_WRAPPER_OPTIONS`

Injection token (`string`) for `WrapperOptions`. Used internally and by `ResponseService`.

```typescript
@Inject(RESPONSE_WRAPPER_OPTIONS) private readonly options: WrapperOptions
```

---

## `SKIP_RESPONSE_WRAPPER_KEY`

Metadata key (`string`) used by `@SkipResponseWrapper()`.

Value: `"skipResponseWrapper"`
