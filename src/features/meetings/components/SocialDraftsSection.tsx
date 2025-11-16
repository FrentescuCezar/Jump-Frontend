"use client"

import { motion } from "motion/react"
import { SocialDraftCard } from "./SocialDraftCard"
import type { SocialPost } from "@/schemas/meetings/details"

type SocialChannel = SocialPost["channel"]

type SocialDraftsSectionProps = {
  posts: SocialPost[]
  meetingId: string
  locale: string
  isAuthorized: boolean
  canPublish: Record<SocialChannel, boolean>
  isLoadingAccounts?: boolean
  onRefresh: () => Promise<unknown> | unknown
  variant?: "page" | "modal"
}

export function SocialDraftsSection({
  posts,
  meetingId,
  locale,
  isAuthorized,
  canPublish,
  isLoadingAccounts = false,
  onRefresh,
  variant = "page",
}: SocialDraftsSectionProps) {
  const drafts = posts.filter((post) =>
    ["DRAFT", "READY", "POSTING"].includes(post.status),
  )

  const title = variant === "page" ? "Social Drafts" : "Social Drafts"
  const titleClass = variant === "page" 
    ? "text-xl font-bold text-gray-200" 
    : "text-lg font-semibold text-white"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <h3 className={titleClass}>{title}</h3>

      {(["LINKEDIN", "FACEBOOK"] as const).map((channel) => {
        const post = drafts.find((item) => item.channel === channel)
        return (
          <SocialDraftCard
            key={channel}
            channel={channel}
            post={post}
            meetingId={meetingId}
            locale={locale}
            isAuthorized={isAuthorized}
            canPublish={canPublish[channel]}
            isLoadingAccounts={isLoadingAccounts}
            onRefresh={onRefresh}
            variant={variant}
          />
        )
      })}
    </motion.div>
  )
}

