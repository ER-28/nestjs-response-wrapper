---
title: Exception Handling
description: How exceptions are caught and formatted
---

The `ResponseExceptionFilter` is automatically registered as a global filter. It catches all exceptions and returns them in the standard `StandardResponse` error format.

## HttpException Handling

NestJS `HttpException` instances are handled with their original status code:

```typescript
throw new BadRequestException('Invalid input');
// Returns 400 with code: "VALIDATION_ERROR"

throw new UnauthorizedException();
// Returns 401 with code: "UNAUTHORIZED_ACCESS"

throw new NotFoundException('Not found');
// Returns 404 with code: "RESOURCE_NOT_FOUND"
```

## Error Code Mapping

The filter maps HTTP status codes to error codes automatically:

| Status Code | Error Code |
|-------------|------------|
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHORIZED_ACCESS` |
| 403 | `FORBIDDEN_ACCESS` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `CONFLICT_ERROR` |
| 500 | `INTERNAL_SERVER_ERROR` |

If the exception provides a custom `code` in its response body, that takes precedence over the default mapping.

## Custom Error Codes

You can provide a custom error code in the exception response:

```typescript
throw new HttpException(
  {
    message: 'Email already exists',
    code: 'DUPLICATE_EMAIL',
    details: ['user@example.com is already registered'],
  },
  HttpStatus.CONFLICT,
);
```

Returns:

```json
{
  "success": false,
  "data": null,
  "meta": { "statusCode": 409, "..." : "..." },
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email already exists",
    "details": ["user@example.com is already registered"]
  }
}
```

## Generic Errors

Non-`HttpException` errors (like plain `Error`) are caught and returned as 500:

```typescript
throw new Error('Something went wrong');
```

Returns:

```json
{
  "success": false,
  "data": null,
  "meta": { "statusCode": 500, "..." : "..." },
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong"
  }
}
```

## String Exceptions

HttpException with a string body:

```typescript
throw new HttpException('Simple error message', HttpStatus.BAD_REQUEST);
```

Returns the string as the error message:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Simple error message"
  }
}
```
