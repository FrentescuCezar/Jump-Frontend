"use client"

import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import {
  Linkedin,
  Facebook,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
  Send,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SOCIAL_CHANNELS } from "../constants/social-channels"
import { useSocialDraftActions } from "../hooks/useSocialDraftActions"
import type { SocialPost } from "@/schemas/meetings/details"

type SocialChannel = SocialPost["channel"]

type SocialDraftCardProps = {
  channel: SocialChannel
  post: SocialPost | undefined
  meetingId: string
  locale: string
  isAuthorized: boolean
  canPublish: boolean
  isLoadingAccounts?: boolean
  onRefresh: () => Promise<unknown> | unknown
  variant?: "page" | "modal"
}

export function SocialDraftCard({
  channel,
  post,
  meetingId,
  locale,
  isAuthorized,
  canPublish,
  isLoadingAccounts = false,
  onRefresh,
  variant = "page",
}: SocialDraftCardProps) {
  const [isExpanded, setIsExpanded] = useState(variant === "page")
  const config = SOCIAL_CHANNELS[channel]
  const Icon = config.icon

  const {
    isCopied,
    handleCopy,
    handleRegenerate,
    handlePublish,
    isRegenerating,
    isPosting,
  } = useSocialDraftActions({
    meetingId,
    locale,
    onRefresh,
  })

  const hasContent = Boolean(post?.content)
  const content = post?.content ?? `${config.name} draft not available yet.`

  if (variant === "page") {
    return (
      <div
        className={`glass-card bg-[#252830]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 transition-all duration-500 ${
          !isAuthorized && "blur-md"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-6 h-6 ${config.color}`} />
          <span className="font-semibold text-gray-200">{config.name} Post</span>
          <Badge variant="secondary">AI Draft</Badge>
        </div>
        <div className="bg-[#1a1d24] rounded-lg p-4 text-sm text-gray-300 min-h-[120px] whitespace-pre-wrap">
          {isAuthorized ? content : "Content hidden"}
        </div>
        {isAuthorized && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRegenerate(channel)}
              disabled={isRegenerating(channel)}
              className="flex-1 min-w-[120px] gap-2"
            >
              {isRegenerating(channel) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isRegenerating(channel) ? "Regenerating…" : "Regenerate"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(channel, post?.content)}
              disabled={!hasContent}
              className="flex-1 min-w-[120px] gap-2"
            >
              {isCopied(channel) ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {isCopied(channel) ? "Copied!" : "Copy"}
            </Button>
            <Button
              size="sm"
              className={`flex-1 ${config.bgColor}`}
              onClick={() => handlePublish(channel, post?.id)}
              disabled={!post?.id || isPosting(channel) || !canPublish}
            >
              {isPosting(channel) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {canPublish
                ? isPosting(channel)
                  ? "Posting…"
                  : "Post"
                : `Connect ${config.name} to post`}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Modal variant
  const shadowStyle =
    channel === "LINKEDIN"
      ? "shadow-[0_25px_90px_rgba(10,102,194,0.35)]"
      : "shadow-[0_25px_90px_rgba(24,119,242,0.35)]"
  const bgGradient =
    channel === "LINKEDIN"
      ? "from-[#0A66C2]/15 via-[#050c1a]/90"
      : "from-[#1877F2]/15 via-[#071121]/90"

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${config.borderColor} bg-gradient-to-br ${bgGradient} to-transparent ${shadowStyle}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-white transition hover:bg-white/5"
      >
        <div className="flex items-center gap-3 text-sm font-medium">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span>{config.name}</span>
          <Badge variant="secondary" className="text-xs bg-white/10 text-white">
            {post?.status ?? "Pending"}
          </Badge>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-300 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3 px-5 pb-5">
              <div className="rounded-xl border border-white/10 bg-[#030711]/90 p-4 text-sm text-gray-100 whitespace-pre-wrap">
                {hasContent ? content : (
                  <span className="text-sm text-gray-400">
                    {config.name} draft not available yet.
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {!isLoadingAccounts && !canPublish && (
                  <p className="text-xs text-amber-300">
                    Connect {config.name} to enable posting.
                  </p>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRegenerate(channel)}
                    disabled={isRegenerating(channel)}
                    className="gap-2 rounded-full border border-white/10 text-white/80 hover:bg-white/10"
                  >
                    {isRegenerating(channel) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {isRegenerating(channel) ? "Regenerating…" : "Regenerate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(channel, post?.content)}
                    disabled={!hasContent}
                    className="flex-1 gap-2 rounded-full border-white/20 bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50"
                  >
                    {isCopied(channel) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {isCopied(channel) ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 ${config.bgColor}`}
                    onClick={() => handlePublish(channel, post?.id)}
                    disabled={!post?.id || isPosting(channel) || !canPublish}
                  >
                    {isPosting(channel) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {!canPublish
                      ? `Connect ${config.name}`
                      : isPosting(channel)
                        ? "Posting…"
                        : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

