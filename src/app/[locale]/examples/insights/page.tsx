import { getTranslations } from "next-intl/server"
import { format } from "date-fns"
import { getPulseInsights } from "@/features/examples/pulse/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function InsightsExamplePage() {
  const [t, pulse] = await Promise.all([
    getTranslations("Examples.Insights"),
    getPulseInsights(),
  ])

  const summary = [
    {
      label: t("summary.focus"),
      value: `${pulse.summary.focusHours}h`,
      helper: t("summary.focusHelper"),
    },
    {
      label: t("summary.contextSwitches"),
      value: pulse.summary.contextSwitches.toString(),
      helper: t("summary.contextHelper"),
    },
    {
      label: t("summary.avgSession"),
      value: `${pulse.summary.avgSessionLength}h`,
      helper: t("summary.avgSessionHelper"),
    },
    {
      label: t("summary.streak"),
      value: `${pulse.summary.focusStreak} ${t("summary.days")}`,
      helper: t("summary.streakHelper"),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-primary">
          {t("badge")}
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("updated", {
              time: format(new Date(pulse.lastUpdated), "PPpp"),
            })}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardHeader className="space-y-1">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <CardTitle className="text-3xl">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle>{t("spotlight.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("spotlight.subtitle")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {pulse.spotlight.map((team) => (
              <div
                key={team.projectId}
                className="flex flex-col gap-2 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{team.projectName}</p>
                  <Badge
                    variant={
                      team.status === "at-risk"
                        ? "destructive"
                        : team.status === "ahead"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {t(`spotlight.status.${team.status}` as const)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("spotlight.sentiment", {
                    sentiment: (team.sentiment * 100).toFixed(0),
                  })}
                </p>
                {team.blockers.length > 0 && (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {team.blockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("experiments.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("experiments.subtitle")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {pulse.experiments.map((exp) => (
              <div
                key={exp.id}
                className="rounded-lg border bg-muted/40 p-4 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{exp.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {t("experiments.eta", { date: exp.eta })}
                  </span>
                </div>
                <p className="text-muted-foreground">{exp.impact}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{t("experiments.owner", { owner: exp.owner })}</span>
                  <span>
                    {t("experiments.confidence", {
                      confidence: (exp.confidence * 100).toFixed(0),
                    })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

