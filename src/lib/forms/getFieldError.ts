import { FieldErrors, FieldValues, Path, UseFormWatch } from "react-hook-form"

/** Server errors keyed by field path */
export type ServerFieldErrors<T extends FieldValues> = Partial<
  Record<Path<T>, string[]>
>

interface Options<T extends FieldValues> {
  watch: UseFormWatch<T>
  clientErrors: FieldErrors<T>
  serverErrors: ServerFieldErrors<T>
  tForm: (key: string, params?: Record<string, string>) => string
  tGlobal: (key: string, params?: Record<string, string>) => string
}

/**
 * Resolve the message to display for a field.
 *
 * Priority:
 * 1. Ignore "true" checkboxes (avoid bogus 'required')
 * 2. Server error (already translated)
 * 3. Client error → translate by convention:
 *    - ALLCAPS: global Common.fieldErrors
 *    - camelCase: form‑specific errors.*
 *
 * WHY:
 * - Centralises messy logic. Inputs can just call `fieldError("email")`.
 */
export function getFieldError<T extends FieldValues>({
  watch,
  clientErrors,
  serverErrors,
  tForm,
  tGlobal,
}: Options<T>) {
  return <K extends Path<T>>(field: K): string | undefined => {
    const value = watch(field)

    const serverMsg = serverErrors[field]?.[0]
    if (serverMsg) return serverMsg

    if (typeof value === "boolean" && value) return undefined

    const clientKey = clientErrors[field]?.message
    if (typeof clientKey === "string") {
      return clientKey === clientKey.toUpperCase()
        ? tGlobal(`Common.fieldErrors.${clientKey}`, {
            field: tForm(`fields.${String(field)}`),
          })
        : tForm(`errors.${clientKey}`, {
            field: tForm(`fields.${String(field)}`),
          })
    }
    return undefined
  }
}
