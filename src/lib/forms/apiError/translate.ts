import { ApiError, ApiFieldError, TIntl } from "./types"
import { processErrorParams } from "./translateParams"

/**
 * Convert any thrown error into a translated string.
 * - Field provided → prefer matching field error
 * - Otherwise → translate top-level error code
 * - Otherwise → generic "UNKNOWN_SERVER_ERROR"
 */
export function translateApiError(
  error: unknown,
  tGlobal: TIntl,
  tForm?: TIntl,
  field?: string,
): string {
  const t = tGlobal ?? tForm
  if (!t) return "Unknown error"

  if (!(error instanceof ApiError)) {
    return t("Common.errors.UNKNOWN_SERVER_ERROR")
  }

  const { code, params, fields } = error.body

  /* Prefer field-specific error if field and fields are provided */
  if (field && Array.isArray(fields) && fields.length) {
    const match = (fields as ApiFieldError[]).find((fe) => fe.field === field)
    if (match) {
      return t(`Common.fieldErrors.${match.code}`, {
        field: tForm ? tForm(`fields.${field}`) : field,
        ...(match.params ?? {}),
      })
    }
  }

  /* Translate top-level error code */
  const finalParams = processErrorParams(params, code, t)
  return t(`Common.errors.${code}`, finalParams)
}

