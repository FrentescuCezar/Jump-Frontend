import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type HomePageProps = {
  params: Promise<{ locale: string }>
}

export default async function LocaleHome({ params }: HomePageProps) {
  const [{ locale }, t] = await Promise.all([
    params,
    getTranslations("Examples.Index"),
  ])

  const cards = [
    {
      href: `/${locale}/examples/insights`,
      title: t("server.title"),
      description: t("server.description"),
      badge: t("server.badge"),
    },
    {
      href: `/${locale}/examples/planner`,
      title: t("client.title"),
      description: t("client.description"),
      badge: t("client.badge"),
    },
    {
      href: `/${locale}/examples/chat`,
      title: t("chat.title"),
      description: t("chat.description"),
      badge: t("chat.badge"),
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:py-14">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-widest text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">{t("title")}</h1>
        <p className="text-lg text-muted-foreground md:text-xl">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <Card
            key={card.href}
            className="flex flex-col border-primary/20 bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary"
          >
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {card.badge}
              </p>
              <CardTitle className="text-2xl">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <p className="text-muted-foreground">{card.description}</p>
              <Link
                href={card.href}
                className="inline-flex items-center gap-2 font-semibold text-primary"
              >
                {t("viewExample")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}




