"use client"

import { useEffect } from "react"
import { toast } from "react-toastify"
import { useTranslations } from "next-intl"
import { ApiError, translateApiError } from "@/lib/forms/apiError"
import { Button } from "@/components/ui/button"

type LocaleErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const t = useTranslations()

  const fallbackMessage =
    error instanceof ApiError
      ? translateApiError(error, t)
      : t("Common.errors.UNKNOWN_SERVER_ERROR")

  useEffect(() => {
    toast.error(fallbackMessage)
    console.error(error)
  }, [error, fallbackMessage])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("Common.resources.Service")} offline
        </p>
        <h1 className="text-3xl font-semibold">
          {t("Common.errors.SERVICE_UNAVAILABLE", { service: "Jump" })}
        </h1>
        <p className="text-muted-foreground">{fallbackMessage}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button
          variant="outline"
          onClick={() => {
            const segments = window.location.pathname.split("/").filter(Boolean)
            const locale = segments[0]
            window.location.assign(locale ? `/${locale}` : "/")
          }}
        >
          Go home
        </Button>
      </div>
    </div>
  )
}
