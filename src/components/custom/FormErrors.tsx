"use client"

import { FormErrorState } from "@/lib/forms"
import { ErrorMessage } from "@/components/custom/ErrorMessage"

interface FormErrorsProps<K extends string = string> {
  /** Error shape from form state */
  errors: FormErrorState<K>
  /** Whether to also render field-level errors (default false) */
  showFieldErrors?: boolean
}

/**
 * FormErrors
 * ==========
 * Small helper component to display form errors consistently.
 *
 * WHY:
 * - Avoids repeating `{errors.general.map(...)}` in every form.
 * - Centralises output of general + field errors.
 *
 * WHEN TO USE:
 * - Drop `<FormErrors errors={state.errors} />` anywhere in JSX.
 */
export function FormErrors<K extends string>({
  errors,
  showFieldErrors = false,
}: FormErrorsProps<K>) {
  return (
    <>
      {/* general (top level) errors */}
      {errors.general.map((msg) => (
        <ErrorMessage key={msg} message={msg} />
      ))}

      {/* per-field errors (optional summary) */}
      {showFieldErrors &&
        Object.entries(errors.fields).map(([field, msgs]) =>
          (msgs as string[] | undefined)?.map((msg, idx) => (
            <ErrorMessage key={`${field}-${idx}`} message={msg} />
          )),
        )}
    </>
  )
}
