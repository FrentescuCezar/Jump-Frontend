export type OnboardingGoogleAccount = {
  id: string
  providerAccountId: string
  email: string | null
  label: string | null
  linkedAt: string
  lastSyncedAt: string | null
}

export type OnboardingSocialConnections = {
  linkedin: boolean
  facebook: boolean
}

export type OnboardingMeetingPreference = {
  leadMinutes: number
  defaultNotetaker: boolean
}

export type OnboardingAutomationPreferences = {
  generateTranscripts: boolean
  createEmailDrafts: boolean
  generateSocialPosts: boolean
}

export type OnboardingState = {
  hasGoogleCalendar: boolean
  isComplete: boolean
  completedAt: string | null
  googleAccounts: OnboardingGoogleAccount[]
  socialConnections: OnboardingSocialConnections
  meetingPreference: OnboardingMeetingPreference
  automationPreferences: OnboardingAutomationPreferences
}

export type UpdateOnboardingPreferencesInput = {
  leadMinutes: number
  autoJoinMeetings: boolean
  generateTranscripts: boolean
  createEmailDrafts: boolean
  generateSocialPosts: boolean
  completeOnboarding?: boolean
}

export type IntegrationProvider = "google" | "linkedin" | "facebook"

