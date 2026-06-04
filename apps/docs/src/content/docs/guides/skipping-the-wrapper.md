---
title: Skipping the Wrapper
description: Skip response wrapping for specific endpoints or routes
---

## Using the Decorator

The `@SkipResponseWrapper()` decorator bypasses the response wrapper for specific controller methods:

```typescript
import { SkipResponseWrapper } from 'nestjs-response-wrapper';

@Controller('items')
export class ItemsController {
  @Get()
  findAll() {
    return this.itemsService.findAll(); // Wrapped in StandardResponse
  }

  @Get('raw')
  @SkipResponseWrapper()
  getRaw() {
    return this.itemsService.findAll(); // Returned as-is
  }
}
```

The `getRaw()` method returns the raw response without any wrapping.

## How It Works

The decorator sets a metadata key on the handler. The `ResponseInterceptor` checks this metadata before wrapping. If the key is present and `true`, the interceptor passes the response through unchanged.

```typescript
// What the decorator does internally
SetMetadata('skipResponseWrapper', true)
```

## Use Cases

- **Health checks** — Return raw status without wrapping
- **File downloads** — Return binary data directly
- **Webhooks** — Return the exact format expected by external services
- **Streaming** — Return raw stream responses
