import { z, ZodTypeAny } from "zod"
import { TIntl } from "./apiError"

/**
 * WHY:
 * - Zod returns raw error codes (e.g. "too_small").
 * - We want ready‑to‑render, translated strings for components.
 *
 * This module:
 * - `translateZodFieldErrors`: turns zod codes into readable text
 * - `validateWithZod`: runs safeParse and returns either {ok:true,data}
 *   or {ok:false,errors,values} in the FormResult style.
 */

/** Translate zod error codes into i18n messages */
export function translateZodFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
  tGlobal: TIntl,
  tForm: TIntl,
): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [field, codes] of Object.entries(fieldErrors)) {
    if (!codes) continue
    out[field] = codes.map((code) =>
      code === code.toUpperCase()
        ? tGlobal(`Common.fieldErrors.${code}`, {
            field: tForm(`fields.${field}`),
          })
        : tForm(`errors.${code}`, {
            field: tForm(`fields.${field}`),
          }),
    )
  }
  return out
}

/** Safe-parse values and return structured result */
export function validateWithZod<
  S extends ZodTypeAny,
  V extends Record<string, unknown>,
>(
  schema: S,
  values: V,
  tGlobal: TIntl,
  tForm: TIntl,
):
  | { ok: true; data: z.infer<S> }
  | {
      ok: false
      errors: {
        general: []
        fields: ReturnType<typeof translateZodFieldErrors>
      }
      values: V
    } {
  const parsed = schema.safeParse(values)
  if (parsed.success) {
    return { ok: true, data: parsed.data }
  }
  return {
    ok: false,
    errors: {
      general: [],
      fields: translateZodFieldErrors(
        parsed.error.flatten().fieldErrors,
        tGlobal,
        tForm,
      ),
    },
    values,
  }
}
