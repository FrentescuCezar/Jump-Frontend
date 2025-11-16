import { Bot, Calendar, Zap, Linkedin } from "lucide-react"

export const automationTemplateConfig = [
  {
    key: "autoJoinMeetings" as const,
    label: "Auto-join all meetings",
    icon: Bot,
  },
  {
    key: "generateTranscripts" as const,
    label: "Generate transcripts",
    icon: Calendar,
  },
  {
    key: "createEmailDrafts" as const,
    label: "Create email drafts",
    icon: Zap,
  },
  {
    key: "generateSocialPosts" as const,
    label: "Generate social media posts",
    icon: Linkedin,
  },
]

