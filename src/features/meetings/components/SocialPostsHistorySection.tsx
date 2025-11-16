"use client"

import { motion } from "motion/react"
import { Linkedin, Facebook, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SOCIAL_CHANNELS, SOCIAL_POST_STATUS_META } from "../constants/social-channels"
import type { SocialPost } from "@/schemas/meetings/details"

type SocialPostsHistorySectionProps = {
  posts: SocialPost[]
  isAuthorized: boolean
}

export function SocialPostsHistorySection({
  posts,
  isAuthorized,
}: SocialPostsHistorySectionProps) {
  const hasPosts = posts.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-bold text-gray-200">Social Posts</h3>
      {!hasPosts && (
        <div className="text-sm text-gray-400">
          {isAuthorized
            ? "No social posts have been generated yet."
            : "Connect to view social posts."}
        </div>
      )}
      {hasPosts &&
        posts.map((post) => {
          const config = SOCIAL_CHANNELS[post.channel]
          const Icon = config.icon
          const status = SOCIAL_POST_STATUS_META[post.status]
          const publishedAt = post.publishedAt
            ? new Date(post.publishedAt).toLocaleString()
            : null

          return (
            <div
              key={post.id}
              className={`glass-card bg-[#1a1d24]/70 border border-white/10 rounded-2xl p-5 space-y-3 ${
                !isAuthorized && "blur-sm"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <div>
                    <div className="font-semibold text-gray-200">
                      {config.name} Post
                    </div>
                    {publishedAt && (
                      <div className="text-xs text-gray-400">
                        Published {publishedAt}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={status.badgeClass}>{status.label}</Badge>
                  {post.externalUrl && (
                    <a
                      href={post.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                      title="View post"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              {isAuthorized && post.content && (
                <div className="text-sm text-gray-300 whitespace-pre-wrap">
                  {post.content}
                </div>
              )}
              {post.error && (
                <div className="text-xs text-red-400 bg-red-500/10 rounded p-2">
                  Error: {post.error}
                </div>
              )}
            </div>
          )
        })}
    </motion.div>
  )
}

