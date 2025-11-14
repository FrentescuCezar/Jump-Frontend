"use client"

import { useTranslations } from "next-intl"
import { Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlannerStore } from "@/features/examples/planner/store"
import { PlannerTemplate } from "@/schemas/examples/planner"

type PlannerTemplatesProps = {
  templates: PlannerTemplate[]
  isLoading: boolean
}

export function PlannerTemplates({
  templates,
  isLoading,
}: PlannerTemplatesProps) {
  const t = useTranslations("Examples.Planner")
  const pinned = usePlannerStore((state) => state.pinnedTemplateId)
  const setPinned = usePlannerStore((state) => state.setPinnedTemplate)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("templates.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("templates.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {isLoading && (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        )}
        {!isLoading &&
          templates.map((template) => {
            const isPinned = pinned === template.id
            return (
              <Button
                key={template.id}
                variant={isPinned ? "default" : "secondary"}
                size="sm"
                onClick={() =>
                  setPinned(isPinned ? undefined : template.id)
                }
                className="gap-2"
              >
                <Pin className="h-4 w-4" />
                {template.name}
              </Button>
            )
          })}
      </CardContent>
    </Card>
  )
}





