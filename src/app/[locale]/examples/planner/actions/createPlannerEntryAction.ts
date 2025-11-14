"use server"

import { getTranslations } from "next-intl/server"
import { failure, Res, success, Val, validateWithZod } from "@/lib/forms"
import { createPlannerEntry } from "@/features/examples/planner/api"
import { PlannerEntrySchema } from "@/schemas/examples/planner"

export async function createPlannerEntryAction(
  _prev: Res<typeof PlannerEntrySchema>,
  values: Val<typeof PlannerEntrySchema>,
): Promise<Res<typeof PlannerEntrySchema>> {
  const [tGlobal, tForm] = await Promise.all([
    getTranslations(),
    getTranslations("PlannerForm"),
  ])

  const validation = validateWithZod(PlannerEntrySchema, values, tGlobal, tForm)
  if (!validation.ok) {
    return validation
  }

  try {
    await createPlannerEntry(validation.data)
    return success(values)
  } catch (error) {
    return failure(error, tGlobal, tForm, values)
  }
}
