export interface ResponseMeta {
  timestamp: string;
  path: string;
  statusCode: number;
  version?: string;
  pagination?: PaginationMeta;
  [key: string]: any;
}

export interface ResponseError {
  code: string;
  message: string;
  details?: any[];
}

export interface StandardResponse<T = any> {
  success: boolean;
  data: T | null;
  meta: ResponseMeta;
  error: ResponseError | null;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
