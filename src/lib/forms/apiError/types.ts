/**
 * API Error types mirror the backend `AppError` envelope.
 *
 * WHY:
 * - Ensures FE always knows the error shape (no `any`).
 * - Enables type‑safe translation of `code` and `fields`.
 */

export type ErrorCode = string
export type FieldErrorCode = string

/** One specific field-level error from backend */
export interface ApiFieldError<P = Record<string, unknown>> {
  field: string
  code: FieldErrorCode
  params?: P
}

/** The full error envelope we receive from backend */
export interface ApiErrorBody<
  P = Record<string, unknown>,
  F extends ApiFieldError[] = ApiFieldError[],
> {
  code: ErrorCode
  params?: P
  fields?: F
}

export class ApiError<
  P = Record<string, unknown>,
  F extends ApiFieldError[] = ApiFieldError[],
> extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody<P, F>,
  ) {
    super(body.code)
  }
}

/** Translator signature from next‑intl */
export type TIntl = (
  key: string,
  vars?: Record<string, string | number | Date>,
) => string
