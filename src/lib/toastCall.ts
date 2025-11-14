"use client"

import { useEffect, useRef } from "react"
import { toast } from "react-toastify"
import { translateApiError, TIntl } from "@/lib/forms/apiError"

/**
 * Translator functions (compatible with next-intl)
 */
export type Translators = {
  tGlobal?: TIntl
  tForm?: TIntl
}

/* ------------------------------------------------------------------ */
/* ToastCall config types                                             */
/* ------------------------------------------------------------------ */

/**
 * Variants of configuration:
 * - success only
 * - error only (static string OR via translators)
 * - both
 */
export type ToastConfigSuccess<T> = {
  operation: Promise<T>
  successMessage: string
  showSuccess: true
  showError?: false
  errorMessage?: never
  translatorsForErrors?: never
  rethrow?: boolean
  strict?: boolean
}

export type ToastConfigErrorWithMsg<T> = {
  operation: Promise<T>
  errorMessage: string
  showError: true
  showSuccess?: false
  successMessage?: never
  translatorsForErrors?: Translators
  rethrow?: boolean
  strict?: boolean
}

export type ToastConfigErrorWithTranslators<T> = {
  operation: Promise<T>
  translatorsForErrors: Translators
  showError: true
  showSuccess?: false
  successMessage?: never
  errorMessage?: string
  rethrow?: boolean
  strict?: boolean
}

export type ToastConfigBothWithMsg<T> = {
  operation: Promise<T>
  successMessage: string
  errorMessage: string
  showSuccess: true
  showError: true
  translatorsForErrors?: Translators
  rethrow?: boolean
  strict?: boolean
}

export type ToastConfigBothWithTranslators<T> = {
  operation: Promise<T>
  successMessage: string
  showSuccess: true
  showError: true
  translatorsForErrors: Translators
  errorMessage?: string
  rethrow?: boolean
  strict?: boolean
}

export type ToastConfig<T> =
  | ToastConfigSuccess<T>
  | ToastConfigErrorWithMsg<T>
  | ToastConfigErrorWithTranslators<T>
  | ToastConfigBothWithMsg<T>
  | ToastConfigBothWithTranslators<T>

/* ------------------------------------------------------------------ */
/* toastCall                                                          */
/* ------------------------------------------------------------------ */

/**
 * Run an async operation and show success/error toast automatically.
 *
 * Rules:
 * - Success → `showSuccess: true` requires `successMessage`
 * - Error   → `showError: true` requires either static `errorMessage`
 *              OR `translatorsForErrors` (to localise ApiError)
 * - If both true → must provide successMessage AND one error source
 */
export async function toastCall<T>(
  config: ToastConfig<T> & { strict: true },
): Promise<T>
export async function toastCall<T>(
  config: ToastConfig<T> & { strict?: false },
): Promise<T | undefined>

export async function toastCall<T>(
  config: ToastConfig<T>,
): Promise<T | undefined> {
  const {
    operation,
    successMessage,
    errorMessage,
    showSuccess,
    showError,
    translatorsForErrors,
    rethrow = false,
    strict = false,
  } = config

  const { tGlobal, tForm } = translatorsForErrors ?? {}

  try {
    const result = await operation

    if (showSuccess && successMessage) {
      toast.success(successMessage)
    }

    return result
  } catch (error) {
    if (showError) {
      const msg =
        errorMessage ??
        (translatorsForErrors
          ? translateApiError(error, tGlobal!, tForm)
          : "Unknown error")

      toast.error(msg)
    }

    if (rethrow) throw error

    return strict ? ({} as T) : undefined
  }
}

/* ------------------------------------------------------------------ */
/* useToast hook                                                      */
/* ------------------------------------------------------------------ */

type ActionState = {
  ok?: boolean
  errors?: {
    general?: string[]
    fields?: Record<string, string[]>
  }
}

type UseToastSuccess = {
  actionState: ActionState
  successMessage: string
  showSuccess: true
  showError?: false
  errorMessage?: never
  translatorsForErrors?: never
  showFieldErrors?: boolean
}

type UseToastErrorWithMsg = {
  actionState: ActionState
  errorMessage: string
  showError: true
  showSuccess?: false
  successMessage?: never
  translatorsForErrors?: Translators
  showFieldErrors?: boolean
}

type UseToastErrorWithTranslators = {
  actionState: ActionState
  translatorsForErrors: Translators
  showError: true
  showSuccess?: false
  successMessage?: never
  errorMessage?: string
  showFieldErrors?: boolean
}

type UseToastBothWithMsg = {
  actionState: ActionState
  successMessage: string
  errorMessage: string
  showSuccess: true
  showError: true
  translatorsForErrors?: Translators
  showFieldErrors?: boolean
}

type UseToastBothWithTranslators = {
  actionState: ActionState
  successMessage: string
  showSuccess: true
  showError: true
  translatorsForErrors: Translators
  errorMessage?: string
  showFieldErrors?: boolean
}

export type UseToastConfig =
  | UseToastSuccess
  | UseToastErrorWithMsg
  | UseToastErrorWithTranslators
  | UseToastBothWithMsg
  | UseToastBothWithTranslators

/**
 * useToast
 * =========
 * React hook: watches a server action state and shows toasts on change.
 *
 * - Success → shows provided message
 * - Error   → uses errorMessage, or translatorsForErrors → translateApiError,
 *             or falls back to field errors
 */
export function useToast(config: UseToastConfig) {
  const previousState = useRef<ActionState | "initial">("initial")

  useEffect(() => {
    if (previousState.current === "initial") {
      previousState.current = config.actionState
      return
    }

    if (previousState.current === config.actionState) return

    if (config.actionState.ok) {
      if (
        "showSuccess" in config &&
        config.showSuccess &&
        config.successMessage
      ) {
        toast.success(config.successMessage)
      }
    } else {
      if ("showError" in config && config.showError) {
        if (config.errorMessage) {
          toast.error(config.errorMessage)
        } else if (config.translatorsForErrors) {
          // Errors are already translated by server action's failure() function
          const msg = config.actionState.errors?.general?.[0]
          if (msg) toast.error(msg)
        } else if (
          config.showFieldErrors &&
          config.actionState.errors?.fields
        ) {
          const fieldMsgs = Object.values(
            config.actionState.errors.fields,
          ).flat()
          if (fieldMsgs.length) toast.error(fieldMsgs.join("\n"))
        }
      }
    }

    previousState.current = config.actionState
  }, [config.actionState, config])
}
