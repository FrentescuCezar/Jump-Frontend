"use client"

import { useCallback, useState } from "react"
import { toast } from "react-toastify"
import { regenerateContentAction } from "@/app/[locale]/meetings/actions/regenerateContent"
import { publishSocialPostAction } from "@/app/[locale]/meetings/[id]/actions/publishSocialPostAction"

export type SocialChannel = "LINKEDIN" | "FACEBOOK"

type PendingState = Record<
  SocialChannel,
  {
    regenerating: boolean
    posting: boolean
  }
>

const EMPTY_PENDING: PendingState = {
  LINKEDIN: { regenerating: false, posting: false },
  FACEBOOK: { regenerating: false, posting: false },
}

type Options = {
  meetingId: string
  locale: string
  onRefresh?: () => Promise<unknown> | unknown
}

export function useSocialDraftActions({
  meetingId,
  locale,
  onRefresh,
}: Options) {
  const [copiedChannel, setCopiedChannel] = useState<SocialChannel | null>(null)
  const [pending, setPending] = useState<PendingState>(EMPTY_PENDING)

  const setPendingState = useCallback(
    (channel: SocialChannel, key: "regenerating" | "posting", value: boolean) => {
      setPending((prev) => ({
        ...prev,
        [channel]: {
          ...prev[channel],
          [key]: value,
        },
      }))
    },
    [],
  )

  const channelToContentType: Record<SocialChannel, "linkedin" | "facebook"> = {
    LINKEDIN: "linkedin",
    FACEBOOK: "facebook",
  }

  const handleCopy = useCallback((channel: SocialChannel, content?: string | null) => {
    if (!content) {
      toast.error("Draft not available to copy yet.")
      return
    }
    navigator.clipboard.writeText(content)
    setCopiedChannel(channel)
    setTimeout(() => {
      setCopiedChannel((prev) => (prev === channel ? null : prev))
    }, 1500)
  }, [])

  const handleRegenerate = useCallback(
    async (channel: SocialChannel) => {
      setPendingState(channel, "regenerating", true)
      try {
        await regenerateContentAction({
          meetingId,
          locale,
          contentType: channelToContentType[channel],
        })
        toast.success(
          `${channel === "LINKEDIN" ? "LinkedIn" : "Facebook"} draft regenerated`,
        )
        await onRefresh?.()
      } catch (error) {
        console.error(error)
        toast.error("Failed to regenerate draft")
      } finally {
        setPendingState(channel, "regenerating", false)
      }
    },
    [locale, meetingId, onRefresh, setPendingState],
  )

  const handlePublish = useCallback(
    async (channel: SocialChannel, postId?: string) => {
      if (!postId) {
        toast.error("Draft not ready to post")
        return
      }
      setPendingState(channel, "posting", true)
      try {
        await publishSocialPostAction({ postId, meetingId, locale })
        toast.success(
          `${channel === "LINKEDIN" ? "LinkedIn" : "Facebook"} post published`,
        )
        await onRefresh?.()
      } catch (error) {
        console.error(error)
        toast.error("Failed to publish post")
      } finally {
        setPendingState(channel, "posting", false)
      }
    },
    [locale, meetingId, onRefresh, setPendingState],
  )

  return {
    copiedChannel,
    isCopied: (channel: SocialChannel) => copiedChannel === channel,
    handleCopy,
    handleRegenerate,
    handlePublish,
    isRegenerating: (channel: SocialChannel) =>
      pending[channel]?.regenerating ?? false,
    isPosting: (channel: SocialChannel) => pending[channel]?.posting ?? false,
  }
}


