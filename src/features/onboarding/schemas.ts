import { z } from "zod"

export const OnboardingGoogleAccountSchema = z.object({
  id: z.string(),
  providerAccountId: z.string(),
  email: z.string().nullable(),
  label: z.string().nullable(),
  linkedAt: z.string(),
  lastSyncedAt: z.string().nullable(),
})

export const OnboardingStateSchema = z.object({
  hasGoogleCalendar: z.boolean(),
  isComplete: z.boolean(),
  completedAt: z.string().nullable(),
  googleAccounts: z.array(OnboardingGoogleAccountSchema),
  socialConnections: z.object({
    linkedin: z.boolean(),
    facebook: z.boolean(),
  }),
  meetingPreference: z.object({
    leadMinutes: z.number(),
    defaultNotetaker: z.boolean(),
  }),
  automationPreferences: z.object({
    generateTranscripts: z.boolean(),
    createEmailDrafts: z.boolean(),
    generateSocialPosts: z.boolean(),
  }),
})

export const UpdateOnboardingPreferencesSchema = z.object({
  leadMinutes: z.number().min(1).max(60),
  autoJoinMeetings: z.boolean(),
  generateTranscripts: z.boolean(),
  createEmailDrafts: z.boolean(),
  generateSocialPosts: z.boolean(),
  completeOnboarding: z.boolean().optional(),
})

