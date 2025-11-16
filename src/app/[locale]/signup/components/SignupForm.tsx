"use client"

import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { useActionState, startTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { Calendar, ArrowRight, Lock } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PasswordStrength } from "@/components/custom/PasswordStrength"
import { FormErrors } from "@/components/custom/FormErrors"
import { getFieldError, initState, Val } from "@/lib/forms"
import { useToast } from "@/lib/toastCall"
import { SignupSchema, passwordRequirements } from "@/schemas/signup/signup"
import { signupAction } from "../actions/signupAction"

type Values = Val<typeof SignupSchema>

export default function SignupForm() {
  const tSignup = useTranslations("Signup")
  const tGlobal = useTranslations()
  const locale = useLocale()

  const [state, formAction, pending] = useActionState(
    signupAction,
    initState(SignupSchema),
  )

  useToast({
    actionState: state,
    showSuccess: true,
    successMessage: tSignup("toastSuccess") || tGlobal("Common.toasts.success"),
    showError: true,
    translatorsForErrors: { tGlobal, tForm: tSignup },
  })

  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors },
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
    },
  })

  const fieldError = getFieldError<Values>({
    watch,
    clientErrors,
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

  const renderError = (key: keyof Values) => {
    const error = fieldError(key)
    if (!error) return null
    return (
      <p className="mt-2 text-sm text-red-300" id={`${key}-error`}>
        {error}
      </p>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0f0520] text-white overflow-hidden relative flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-10 bg-gradient-to-r from-purple-500 to-blue-500"
          animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15 bg-gradient-to-r from-cyan-500 to-teal-500"
          animate={{ x: [0, -80, 0], y: [0, 80, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "20%", right: "10%" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          className="flex items-center justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        ></motion.div>

        <motion.div
          className="glass-card border border-white/20 backdrop-blur-xl bg-white/5 rounded-3xl p-8 shadow-2xl mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center space-y-4">
            <p className="text-gray-300">{tSignup("alreadyHaveAccount")}</p>
            <Button
              type="button"
              onClick={() => signIn("keycloak", { callbackUrl: `/${locale}` })}
              className="w-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 text-white border border-white/20 backdrop-blur-xl flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {tSignup("signInCta")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-gray-400">
              {tSignup("divider")}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="glass-card border border-white/20 backdrop-blur-xl bg-white/5 rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-6 text-sm text-purple-300">
            <Lock className="w-4 h-4" />
            <span>{tSignup("securedWithKeycloak")}</span>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
            autoComplete="off"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Label
                  htmlFor="firstName"
                  className="text-gray-300 mb-2 block text-sm"
                >
                  {tSignup("fields.firstName")}
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={tSignup("placeholder.firstName")}
                  autoComplete="given-name"
                  aria-invalid={fieldError("firstName") ? "true" : "false"}
                  aria-describedby="firstName-error"
                  {...register("firstName")}
                  className="bg-white/5 border-white/20 backdrop-blur-xl text-white placeholder:text-gray-500 focus:border-purple-500"
                />
                {renderError("firstName")}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Label
                  htmlFor="lastName"
                  className="text-gray-300 mb-2 block text-sm"
                >
                  {tSignup("fields.lastName")}
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={tSignup("placeholder.lastName")}
                  autoComplete="family-name"
                  aria-invalid={fieldError("lastName") ? "true" : "false"}
                  aria-describedby="lastName-error"
                  {...register("lastName")}
                  className="bg-white/5 border-white/20 backdrop-blur-xl text-white placeholder:text-gray-500 focus:border-purple-500"
                />
                {renderError("lastName")}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Label
                htmlFor="email"
                className="text-gray-300 mb-2 block text-sm"
              >
                {tSignup("fields.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={tSignup("placeholder.email")}
                autoComplete="off"
                aria-invalid={fieldError("email") ? "true" : "false"}
                aria-describedby="email-error"
                {...register("email")}
                className="bg-white/5 border-white/20 backdrop-blur-xl text-white placeholder:text-gray-500 focus:border-purple-500"
              />
              {renderError("email")}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="space-y-2"
            >
              <Label
                htmlFor="password"
                className="text-gray-300 mb-2 block text-sm"
              >
                {tSignup("fields.password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={tSignup("placeholder.password")}
                autoComplete="new-password"
                aria-invalid={fieldError("password") ? "true" : "false"}
                aria-describedby="password-error"
                {...passwordRegistration}
                className="bg-white/5 border-white/20 backdrop-blur-xl text-white placeholder:text-gray-500 focus:border-purple-500"
              />
              {renderError("password")}
              {password && (
                <PasswordStrength
                  password={password}
                  requirements={requirementsWithLabels}
                  className="mt-3 rounded-md border border-white/10 bg-black/20 p-3"
                />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Label
                htmlFor="confirmPassword"
                className="text-gray-300 mb-2 block text-sm"
              >
                {tSignup("fields.confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={tSignup("placeholder.confirmPassword")}
                autoComplete="new-password"
                aria-invalid={fieldError("confirmPassword") ? "true" : "false"}
                aria-describedby="confirmPassword-error"
                {...confirmPasswordRegistration}
                className="bg-white/5 border-white/20 backdrop-blur-xl text-white placeholder:text-gray-500 focus:border-purple-500"
              />
              {renderError("confirmPassword")}
            </motion.div>

            <FormErrors errors={state.errors} />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <Button
                type="submit"
                disabled={pending}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-purple-500/50"
              >
                {pending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Lock className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    {tSignup("button")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.p
            className="text-xs text-gray-400 text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            {tSignup("terms")}
          </motion.p>
        </motion.div>

        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <Link
            href={`/${locale}`}
            className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            {tSignup("backToHome")}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
