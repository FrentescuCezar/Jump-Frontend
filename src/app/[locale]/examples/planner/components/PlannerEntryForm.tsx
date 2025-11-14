"use client"

import { useActionState, startTransition } from "react"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlannerStore } from "@/features/examples/planner/store"
import {
  PlannerEntryInput,
  PlannerEntrySchema,
  PlannerProject,
  PlannerTemplate,
  PlannerRangeInput,
  activityTypes,
} from "@/schemas/examples/planner"
import { initState, getFieldError } from "@/lib/forms"
import { createPlannerEntryAction } from "../actions/createPlannerEntryAction"
import { useToast } from "@/lib/toastCall"
import { FormErrors } from "@/components/custom/FormErrors"
import {
  usePlannerFormSync,
  usePlannerFormSubmission,
} from "@/features/examples/planner/hooks"

type PlannerEntryFormProps = {
  projects: PlannerProject[]
  templates: PlannerTemplate[]
  range: PlannerRangeInput
}

export function PlannerEntryForm({
  projects,
  templates,
  range,
}: PlannerEntryFormProps) {
  const tForm = useTranslations("PlannerForm")
  const tGlobal = useTranslations()
  const selectedDate = usePlannerStore((state) => state.selectedDate)
  const pinnedTemplateId = usePlannerStore((state) => state.pinnedTemplateId)
  const [state, formAction, pending] = useActionState(
    createPlannerEntryAction,
    initState(PlannerEntrySchema),
  )

  const defaultProject = projects[0]
  const isDisabled = projects.length === 0
  const pinnedTemplate = templates.find(
    (template) => template.id === pinnedTemplateId,
  )

  const {
    handleSubmit,
    register,
    control,
    reset,
    watch,
    setValue,
    formState: { errors: clientErrors },
  } = useForm<PlannerEntryInput>({
    resolver: zodResolver(PlannerEntrySchema),
    defaultValues: {
      userId: range.userId,
      date: selectedDate,
      projectId: defaultProject?.id ?? "",
      activityType: defaultProject?.defaultActivity ?? activityTypes[0],
      hours: 2,
      description: "",
    },
  })

  const fieldError = getFieldError<PlannerEntryInput>({
    watch,
    clientErrors,
    serverErrors: state.errors.fields,
    tForm,
    tGlobal,
  })

  // Sync form with Zustand state and handle pinned templates
  usePlannerFormSync({
    setValue,
    reset,
    range,
    pinnedTemplate,
  })

  // Handle successful submission
  usePlannerFormSubmission({
    state,
    reset,
    range,
  })

  useToast({
    actionState: state,
    showSuccess: true,
    successMessage: tForm("toastSuccess"),
    showError: true,
    translatorsForErrors: { tGlobal, tForm },
  })

  const onSubmit = (values: PlannerEntryInput) => {
    startTransition(() => {
      formAction(values)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tForm("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{tForm("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <fieldset
            disabled={pending || isDisabled}
            className="space-y-4 disabled:opacity-75"
          >
            <input type="hidden" {...register("userId")} />
            <input type="hidden" {...register("date")} />
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {tForm("fields.projectId")}
              </label>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      const project = projects.find((p) => p.id === value)
                      if (project) {
                        setValue("activityType", project.defaultActivity)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={tForm("placeholders.project")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {fieldError("projectId") && (
                <p className="text-sm text-destructive">
                  {fieldError("projectId")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {tForm("fields.activityType")}
              </label>
              <Controller
                control={control}
                name="activityType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={tForm("placeholders.activity")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {tForm(`activities.${type}` as const)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {fieldError("activityType") && (
                <p className="text-sm text-destructive">
                  {fieldError("activityType")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {tForm("fields.hours")}
              </label>
              <Input
                type="number"
                step="0.25"
                min="0.25"
                max="12"
                {...register("hours", { valueAsNumber: true })}
              />
              {fieldError("hours") && (
                <p className="text-sm text-destructive">
                  {fieldError("hours")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {tForm("fields.description")}
              </label>
              <Textarea
                rows={4}
                placeholder={tForm("placeholders.description")}
                {...register("description")}
              />
              {fieldError("description") && (
                <p className="text-sm text-destructive">
                  {fieldError("description")}
                </p>
              )}
            </div>
          </fieldset>

          <FormErrors errors={state.errors} />

          <Button
            type="submit"
            className="w-full"
            disabled={pending || isDisabled}
          >
            {pending ? tForm("saving") : tForm("submit")}
          </Button>
        </form>
        {isDisabled && (
          <p className="text-xs text-muted-foreground">{tForm("noProjects")}</p>
        )}
      </CardContent>
    </Card>
  )
}
