import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { StandardResponse } from "../interfaces/response.interface";
import { WrapperOptions } from "../interfaces/wrapper-options.interface";
import { RESPONSE_WRAPPER_OPTIONS } from "../response-wrapper.module";

const ERROR_CODE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "VALIDATION_ERROR",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED_ACCESS",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN_ACCESS",
  [HttpStatus.NOT_FOUND]: "RESOURCE_NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT_ERROR",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "INTERNAL_SERVER_ERROR",
};

@Injectable()
export class ResponseExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(RESPONSE_WRAPPER_OPTIONS) private readonly options: WrapperOptions,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception.message };

    const message =
      typeof errorResponse === "string"
        ? errorResponse
        : (errorResponse as any).message || exception.message;

    const details =
      typeof errorResponse === "object"
        ? (errorResponse as any).details || null
        : null;

    const errorCode =
      (errorResponse as any).code ||
      ERROR_CODE_MAP[statusCode] ||
      "INTERNAL_SERVER_ERROR";

    const standardResponse: StandardResponse = {
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode,
        version: this.options.version,
      },
      error: {
        code: errorCode,
        message: message,
        details: details,
      },
    };

    if (this.options.debug) {
      standardResponse.meta.stack = exception.stack;
    }
    response.status(statusCode).json(standardResponse);
  }
}
