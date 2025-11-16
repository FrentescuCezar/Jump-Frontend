import { Linkedin, Facebook } from "lucide-react"
import type { SocialChannel } from "@/schemas/meetings/details"

export const SOCIAL_CHANNELS: Record<
  SocialChannel,
  {
    name: string
    icon: typeof Linkedin
    color: string
    bgColor: string
    borderColor: string
    shadowColor: string
  }
> = {
  LINKEDIN: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]",
    borderColor: "border-[#0A66C2]/40",
    shadowColor: "rgba(10,102,194,0.35)",
  },
  FACEBOOK: {
    name: "Facebook",
    icon: Facebook,
    color: "text-[#1877F2]",
    bgColor: "bg-[#1877F2]",
    borderColor: "border-[#1877F2]/40",
    shadowColor: "rgba(24,119,242,0.35)",
  },
}

export const SOCIAL_POST_STATUS_META: Record<
  "DRAFT" | "READY" | "POSTING" | "POSTED" | "FAILED",
  { label: string; badgeClass: string }
> = {
  DRAFT: { label: "Draft", badgeClass: "bg-gray-700 text-gray-200" },
  READY: { label: "Ready", badgeClass: "bg-blue-500/20 text-blue-100" },
  POSTING: {
    label: "Posting",
    badgeClass: "bg-purple-500/20 text-purple-100",
  },
  POSTED: {
    label: "Posted",
    badgeClass: "bg-emerald-500/20 text-emerald-100",
  },
  FAILED: { label: "Failed", badgeClass: "bg-red-500/20 text-red-100" },
}


