import { getTranslations } from "next-intl/server"

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("Login")])

  return (
    <div className="container mx-auto max-w-xl py-12 px-4">
      <div className="space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            {t("badge")}
          </p>
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>
    </div>
  )
}
