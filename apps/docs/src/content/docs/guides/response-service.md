---
title: Response Service
description: Use ResponseService for manual response building
---

The `ResponseService` is an injectable service that provides helper methods for building standardized responses manually.

## When to Use

- You need to build responses outside of a controller method
- You're creating custom interceptors or middleware
- You want to reuse meta-building logic in services

## Usage

```typescript
import { Injectable } from '@nestjs/common';
import { ResponseService } from 'nestjs-response-wrapper';

@Injectable()
export class ItemsService {
  constructor(private readonly responseService: ResponseService) {}

  findAll() {
    const items = [{ id: 1 }, { id: 2 }];

    return this.responseService.wrapSuccess(items, {
      path: '/items',
      statusCode: 200,
    });
  }
}
```

## Methods

### `createMeta(path, statusCode, pagination?)`

Builds a `ResponseMeta` object:

```typescript
const meta = service.createMeta('/items', 200);
// {
//   timestamp: "2026-01-01T00:00:00.000Z",
//   path: "/items",
//   statusCode: 200,
//   version: "1.0.0"
// }

const paginatedMeta = service.createMeta('/items', 200, {
  totalItems: 100,
  currentPage: 1,
});
// Includes pagination field
```

### `wrapSuccess<T>(data, meta?)`

Wraps data in a `StandardResponse<T>`:

```typescript
const response = service.wrapSuccess({ id: 1, name: 'Item' });
// {
//   success: true,
//   data: { id: 1, name: "Item" },
//   meta: { timestamp: "...", path: "/unknown", statusCode: 200, version: "1.0.0" },
//   error: null
// }

// Override meta fields
const response = service.wrapSuccess(data, { path: '/custom', statusCode: 201 });
```

## Registration

The `ResponseService` is automatically available when you import `ResponseWrapperModule`. If you need it in a specific module, you can also import it directly:

```typescript
@Module({
  imports: [ResponseWrapperModule.forRoot(options)],
  providers: [ItemsService],
})
export class ItemsModule {}
```

The service will have access to the same `WrapperOptions` configured in the module.
