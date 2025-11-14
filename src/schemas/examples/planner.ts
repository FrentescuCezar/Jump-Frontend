import { z } from "zod"

export const activityTypes = ["deep-work", "review", "support"] as const

export const PlannerRangeSchema = z.object({
  userId: z.string({ message: "REQUIRED" }).min(1, { message: "REQUIRED" }),
  start: z.string({ message: "REQUIRED" }),
  end: z.string({ message: "REQUIRED" }),
})

export const PlannerEntrySchema = z.object({
  userId: z.string({ message: "REQUIRED" }).min(1, { message: "REQUIRED" }),
  date: z.string({ message: "REQUIRED" }),
  projectId: z.string({ message: "REQUIRED" }),
  activityType: z.enum(activityTypes, { message: "SELECT" }),
  hours: z
    .number({ message: "REQUIRED" })
    .min(0.25, { message: "TOO_SHORT" })
    .max(12, { message: "TOO_LONG" }),
  description: z
    .string({ message: "REQUIRED" })
    .min(4, { message: "TOO_SHORT" })
    .max(240, { message: "TOO_LONG" }),
})

export const PlannerEntryResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  activityType: z.enum(activityTypes),
  hours: z.number(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const PlannerEntriesResponseSchema = z.object({
  range: z.object({
    start: z.string(),
    end: z.string(),
  }),
  entries: z.array(PlannerEntryResponseSchema),
  totals: z.object({
    totalHours: z.number(),
    daysWithEntries: z.number(),
  }),
  serverTimestamp: z.string(),
})

export const PlannerCreateResponseSchema = z.object({
  entry: PlannerEntryResponseSchema,
  serverTimestamp: z.string(),
})

export const PlannerProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  defaultActivity: z.enum(activityTypes),
  blockedBy: z.array(z.string()).optional(),
})

export const PlannerTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  projectId: z.string(),
  activityType: z.enum(activityTypes),
  hours: z.number(),
  description: z.string(),
})

export const PlannerProjectsResponseSchema = z.object({
  projects: z.array(PlannerProjectSchema),
  templates: z.array(PlannerTemplateSchema),
  serverTimestamp: z.string(),
})

export const PlannerDeltaSyncSchema = z.object({
  userId: z.string(),
  updatedSince: z.string(),
  start: z.string().optional(),
  end: z.string().optional(),
})

export const PlannerDeltaSyncResponseSchema = z.object({
  entries: z.array(PlannerEntryResponseSchema),
  deletedIds: z.array(z.string()),
  serverTimestamp: z.string(),
})

export type PlannerRangeInput = z.infer<typeof PlannerRangeSchema>
export type PlannerEntryInput = z.infer<typeof PlannerEntrySchema>
export type PlannerEntry = z.infer<typeof PlannerEntryResponseSchema>
export type PlannerEntriesResponse = z.infer<
  typeof PlannerEntriesResponseSchema
>
export type PlannerProject = z.infer<typeof PlannerProjectSchema>
export type PlannerTemplate = z.infer<typeof PlannerTemplateSchema>
export type PlannerProjectsResponse = z.infer<
  typeof PlannerProjectsResponseSchema
>
export type PlannerCreateResponse = z.infer<
  typeof PlannerCreateResponseSchema
>
export type PlannerDeltaSyncInput = z.infer<typeof PlannerDeltaSyncSchema>
export type PlannerDeltaSyncResponse = z.infer<
  typeof PlannerDeltaSyncResponseSchema
>

