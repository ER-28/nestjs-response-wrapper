---
title: Pagination
description: Automatic pagination detection and formatting
---

The interceptor automatically detects pagination fields in your response data and formats them into a consistent `PaginationMeta` structure.

## Detected Field Names

The library supports multiple naming conventions:

| Purpose | Recognized Names |
|---------|-----------------|
| Total count | `total`, `totalItems`, `count` |
| Page size | `limit`, `pageSize`, `itemsPerPage` |
| Current page | `page`, `currentPage` |

## Example

A controller returning:

```typescript
@Get('items')
findAll() {
  return {
    items: [{ id: 1 }, { id: 2 }],
    total: 50,
    limit: 10,
    page: 1,
  };
}
```

Will produce:

```json
{
  "success": true,
  "data": [{ "id": 1 }, { "id": 2 }],
  "meta": {
    "pagination": {
      "totalItems": 50,
      "itemCount": 10,
      "itemsPerPage": 10,
      "totalPages": 5,
      "currentPage": 1
    }
  }
}
```

## PaginationMeta

```typescript
interface PaginationMeta {
  totalItems: number;      // Total number of items
  itemCount: number;       // Number of items in this page
  itemsPerPage: number;    // Items per page
  totalPages: number;      // Total number of pages
  currentPage: number;     // Current page number
}
```

## Data Extraction

When pagination is detected, the interceptor extracts the data array from:
1. `data.items` (preferred)
2. `data.data` (fallback)
3. The raw object (if neither `items` nor `data` exist)

So your controller can return either:

```typescript
// Option A: items key
{ items: [...], total: 100, limit: 10 }

// Option B: data key
{ data: [...], total: 100, limit: 10 }
```

Both will produce the same `data` array in the response.

## No Pagination

If no pagination fields are detected (e.g., a simple object or array), `pagination` is `null` and the data is returned as-is.
