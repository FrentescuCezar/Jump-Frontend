import { z, ZodTypeAny } from "zod"
import { apiErrorToFormState, FormErrorState } from "./errorState"
import type { TIntl } from "./apiError"

/**
 * Helpers around standardised FormResult.
 *
 * WHY:
 * - Every server action returns uniform {ok, errors, values}
 * - React code never needs to branch by error shape
 */

/* Schema-driven aliases */
export type Val<S extends ZodTypeAny> = z.infer<S>
export type Res<S extends ZodTypeAny> = FormResult<z.infer<S>>

/** Common return type of all form actions */
export interface FormResult<V extends Record<string, unknown>> {
  ok: boolean
  errors: FormErrorState<Extract<keyof V, string>>
  values: Partial<V>
}

/**
 * Typed initial state for client components.
 * Usage: `useActionState(fn, initState(MySchema))`
 */
export function initState<S extends ZodTypeAny>(_schema: S): Res<S>
export function initState<V extends Record<string, unknown>>(): FormResult<V>
export function initState(): unknown {
  return { ok: false, errors: { general: [], fields: {} }, values: {} }
}

/** Wrap values in a success result */
export function success<V extends Record<string, unknown>>(
  values: V,
): FormResult<V> {
  return { ok: true, errors: { general: [], fields: {} }, values }
}

/** Wrap caught error into failure result */
export function failure<V extends Record<string, unknown>>(
  error: unknown,
  tGlobal: TIntl,
  tForm: TIntl,
  values: V,
): FormResult<V> {
  return {
    ok: false,
    errors: apiErrorToFormState<Extract<keyof V, string>>(
      error,
      tGlobal,
      tForm,
    ),
    values,
  }
}
