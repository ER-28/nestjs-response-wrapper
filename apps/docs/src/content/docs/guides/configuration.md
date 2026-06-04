---
title: Configuration
description: Configure nestjs-response-wrapper with forRoot and forRootAsync
---

## Options

The `WrapperOptions` interface controls the library behavior:

```typescript
interface WrapperOptions {
  enableGlobalInterceptor: boolean;  // Enable/disable the global interceptor
  includeMeta: boolean;              // Include meta in responses
  debug: boolean;                    // Include debug info (stack traces, memory usage)
  version: string;                   // API version included in every response
  excludeRoutes: string[];           // Routes to skip wrapping (matched via string.includes)
}
```

## forRoot (Synchronous)

Use `forRoot()` when your configuration is available at build time:

```typescript
ResponseWrapperModule.forRoot({
  enableGlobalInterceptor: true,
  includeMeta: true,
  debug: process.env.NODE_ENV !== 'production',
  version: '1.0.0',
  excludeRoutes: ['/health', '/metrics'],
})
```

## forRootAsync (Asynchronous)

Use `forRootAsync()` when you need to load configuration from a database, config service, or any async source:

```typescript
ResponseWrapperModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    enableGlobalInterceptor: true,
    includeMeta: true,
    debug: configService.get('DEBUG', false),
    version: configService.get('API_VERSION', '1.0.0'),
    excludeRoutes: ['/health'],
  }),
  inject: [ConfigService],
})
```

The `inject` array is passed to the factory function's parameters, just like any NestJS `useFactory` provider.

## Global by Default

The module is decorated with `@Global()`, so you only need to import it once in your root module. All sub-modules will have access to the interceptor and filter automatically.

## Route Exclusion

The `excludeRoutes` option uses `String.includes()` for matching. This means:

- `'/health'` matches `/health`, `/api/health`, `/health/check`
- `'/api/v1'` matches any route containing `/api/v1`

```typescript
excludeRoutes: ['/health', '/metrics', '/internal']
```

Routes that match are passed through without wrapping — the raw response is returned as-is.
