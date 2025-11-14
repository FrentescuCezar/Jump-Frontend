import { ApiError, translateApiError, TIntl } from "./apiError"

/**
 * Error shape consumed by FE forms:
 * - general: top-level messages
 * - fields : per-field map
 */
export interface FormErrorState<K extends string = string> {
  general: string[]
  fields: Partial<Record<K, string[]>>
}

/**
 * Normalise any thrown error into a FormErrorState.
 *
 * Rules:
 * 1. Not ApiError → generic UNKNOWN_SERVER_ERROR
 * 2. ApiError with fields → map into `fields`
 * 3. ApiError without fields → put code into `general`
 *
 * WHY:
 * - Keeps React components simple — always expect {general,fields}.
 */
export function apiErrorToFormState<K extends string>(
  error: unknown,
  tGlobal: TIntl,
  tForm: TIntl,
): FormErrorState<K> {
  if (!(error instanceof ApiError)) {
    return {
      general: [tGlobal("Common.errors.UNKNOWN_SERVER_ERROR")],
      fields: {},
    }
  }

  if (error.body.fields?.length) {
    const fields: Partial<Record<K, string[]>> = {}
    for (const fe of error.body.fields) {
      const key = fe.field as K
      const msg = translateApiError(error, tGlobal, tForm, key)
      ;(fields[key] ??= []).push(msg)
    }
    return { general: [], fields }
  }

  return {
    general: [translateApiError(error, tGlobal, tForm)],
    fields: {},
  }
}
