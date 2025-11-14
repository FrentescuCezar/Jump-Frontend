import { z } from "zod"

export const PulseSpotlightSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  sentiment: z.number(),
  status: z.enum(["ahead", "on-track", "at-risk"]),
  blockers: z.array(z.string()),
})

export const PulseExperimentSchema = z.object({
  id: z.string(),
  title: z.string(),
  owner: z.string(),
  eta: z.string(),
  confidence: z.number(),
  impact: z.string(),
})

export const PulseResponseSchema = z.object({
  lastUpdated: z.string(),
  summary: z.object({
    focusHours: z.number(),
    contextSwitches: z.number(),
    avgSessionLength: z.number(),
    focusStreak: z.number(),
  }),
  spotlight: z.array(PulseSpotlightSchema),
  experiments: z.array(PulseExperimentSchema),
})

export type PulseResponse = z.infer<typeof PulseResponseSchema>
export type PulseSpotlight = z.infer<typeof PulseSpotlightSchema>
export type PulseExperiment = z.infer<typeof PulseExperimentSchema>





