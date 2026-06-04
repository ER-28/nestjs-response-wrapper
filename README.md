# nestjs-response-wrapper

A professional response standardization library for NestJS. Automatically wraps all HTTP responses into a consistent `StandardResponse` envelope with metadata, pagination, and error handling.

## Features

- **Automatic wrapping** — All responses wrapped via a global interceptor
- **Exception handling** — Errors caught and formatted into a consistent error shape
- **Pagination detection** — Auto-detects pagination fields (`total`, `limit`, `page`, etc.)
- **Binary passthrough** — Skips wrapping for binary content types (PDFs, images, streams)
- **Skip decorator** — Skip wrapping for specific endpoints with `@SkipResponseWrapper()`
- **Route exclusion** — Exclude specific routes from wrapping
- **Async configuration** — Load config from any async source (database, config service, etc.)
- **Debug mode** — Include stack traces and memory usage in development

## Quick Start

```bash
pnpm add nestjs-response-wrapper
```

```typescript
// app.module.ts
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

Every response now follows this format:

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

## Documentation

Full documentation is available in the [`apps/docs`](./apps/docs) directory, or deployed to GitHub Pages.

## Monorepo Structure

This project uses [Turborepo](https://turborepo.dev/) with pnpm workspaces.

```
.
├── apps/
│   ├── docs/           # Starlight documentation site
│   └── example/        # Example NestJS app using the library
├── packages/
│   └── nestjs-response-wrapper/   # The library (published to npm)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run docs dev server
pnpm dev --filter=docs

# Run example app
pnpm dev --filter=example
```

## Testing

```bash
# Run all tests via turbo
pnpm test

# Run library tests only
cd packages/nestjs-response-wrapper && pnpm test
```

## License

MIT
