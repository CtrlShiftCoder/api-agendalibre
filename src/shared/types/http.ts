export interface ApiSuccessMeta {
  requestId?: string;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: ApiSuccessMeta;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiError {
  error: ApiErrorBody;
}

export function ok<T>(data: T, meta?: ApiSuccessMeta): ApiSuccess<T> {
  return meta ? { data, meta } : { data };
}

export function fail(
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return { error: { code, message, ...(details !== undefined ? { details } : {}) } };
}
