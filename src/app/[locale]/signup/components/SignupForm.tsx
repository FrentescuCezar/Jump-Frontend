"use client"

import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { useActionState, startTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormField } from "@/components/custom/FormField"
import { PasswordField } from "@/components/custom/PasswordField"
import { PasswordStrength } from "@/components/custom/PasswordStrength"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getFieldError, initState, Val } from "@/lib/forms"
import { useToast } from "@/lib/toastCall"
import { SignupSchema, passwordRequirements } from "@/schemas/signup/signup"
import { signupAction } from "../actions/signupAction"
import { FormErrors } from "@/components/custom/FormErrors"
import { Label } from "@/components/ui/label"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Values = Val<typeof SignupSchema>

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function SignupForm() {
  /* ---------------------------- i18n ---------------------------- */
  const tSignup = useTranslations("Signup")
  const locale = useLocale()
  const tGlobal = useTranslations()

  /* --------------------------- state ---------------------------- */
  const [state, formAction, pending] = useActionState(
    signupAction,
    initState(SignupSchema),
  )

  /* --------------------------- toast ---------------------------- */
  useToast({
    actionState: state,
    showSuccess: true,
    successMessage: tSignup("toastSuccess") || tGlobal("Common.toasts.success"),
    showError: true,
    translatorsForErrors: { tGlobal, tForm: tSignup },
  })

  /* --------------------- react-hook-form ------------------------ */
  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors, isValid },
    control,
    watch,
    trigger,
    getValues,
  } = useForm<Values>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
    defaultValues: {
      firstName: state.values.firstName ?? "",
      lastName: state.values.lastName ?? "",
      email: state.values.email ?? "",
      password: state.values.password ?? "",
      confirmPassword: state.values.confirmPassword ?? "",
      brand: state.values.brand ?? "",
    },
  })

  const fieldError = getFieldError<Values>({
    watch,
    clientErrors: clientErrors,
    serverErrors: state.errors.fields,
    tForm: tSignup,
    tGlobal,
  })

  const password = watch("password") || ""

  const passwordRegistration = register("password", {
    onChange: () => {
      if (getValues("confirmPassword")) {
        trigger("confirmPassword")
      }
    },
  })
  const confirmPasswordRegistration = register("confirmPassword")

  const requirementsWithLabels = passwordRequirements.map((req) => ({
    ...req,
    label: tSignup(req.label),
  }))

  const onSubmit = (data: Values) => startTransition(() => formAction(data))

  /* ----------------------------- UI ----------------------------- */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
      autoComplete="off"
    >
      <FormField
        name="firstName"
        label={tSignup("fields.firstName")}
        error={fieldError("firstName")}
        placeholder={tSignup("placeholder.firstName")}
        autoComplete="given-name"
        inputProps={register("firstName")}
      />

      <FormField
        name="lastName"
        label={tSignup("fields.lastName")}
        error={fieldError("lastName")}
        placeholder={tSignup("placeholder.lastName")}
        autoComplete="family-name"
        inputProps={register("lastName")}
      />

      <FormField
        name="email"
        label={tSignup("fields.email")}
        error={fieldError("email")}
        type="email"
        placeholder={tSignup("placeholder.email")}
        autoComplete="off"
        inputProps={register("email")}
      />

      <div className="space-y-2">
        <PasswordField
          name="password"
          label={tSignup("fields.password")}
          placeholder={tSignup("placeholder.password")}
          error={fieldError("password")}
          autoComplete="new-password"
          inputProps={passwordRegistration}
        />
        {password && (
          <PasswordStrength
            password={password}
            requirements={requirementsWithLabels}
            className="mt-3 rounded-md border p-3"
          />
        )}
      </div>

      <PasswordField
        name="confirmPassword"
        label={tSignup("fields.confirmPassword")}
        error={fieldError("confirmPassword")}
        autoComplete="new-password"
        inputProps={confirmPasswordRegistration}
      />

      <div className="space-y-2">
        <Label htmlFor="brand">{tSignup("fields.brand")}</Label>
        <Controller
          name="brand"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger
                id="brand"
                aria-invalid={fieldError("brand") ? "true" : "false"}
              >
                <SelectValue placeholder={tSignup("chooseBrand")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toyota">Toyota</SelectItem>
                <SelectItem value="honda">Honda</SelectItem>
                <SelectItem value="ford">Ford</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {fieldError("brand") && (
          <p id="brand-error" className="text-sm text-destructive">
            {fieldError("brand")}
          </p>
        )}
      </div>

      <FormErrors errors={state.errors} />

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? tSignup("processing") : tSignup("button")}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {tSignup.rich("already", {
          link: (chunks) => (
            <Link
              href={`/${locale}/login`}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  )
}
