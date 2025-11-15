"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { meetingDetailsKey } from "@/features/meetings/queries"
import { useMeetingDetails } from "@/features/meetings/hooks/useMeetingDetails"
import { regenerateMeetingAction, publishSocialPostAction } from "@/app/[locale]/meetings/[id]/actions"
import { formatMeetingTimeRange } from "@/features/calendar/utils/formatMeetingTimeRange"

type MeetingDetailsClientProps = {
  meetingId: string
  userId: string
  locale: string
}

export default function MeetingDetailsClient({
  meetingId,
  userId,
  locale,
}: MeetingDetailsClientProps) {
  const queryClient = useQueryClient()
  const queryKey = meetingDetailsKey({ meetingId, userId, locale })
  const { query, details } = useMeetingDetails({ meetingId, userId, locale })
  const [isRegenerating, startRegenerate] = useTransition()
  const [pendingPostId, setPendingPostId] = useState<string | null>(null)

  const drafts = useMemo(
    () =>
      (details?.socialPosts ?? []).filter((post) =>
        ["DRAFT", "READY", "POSTING"].includes(post.status),
      ),
    [details?.socialPosts],
  )

  const history = useMemo(
    () =>
      (details?.socialPosts ?? []).filter((post) =>
        ["POSTED", "FAILED"].includes(post.status),
      ),
    [details?.socialPosts],
  )

  const transcriptMedia = details?.media.find(
    (media) => media.type === "TRANSCRIPT" && media.available,
  )

  const rangeLabel = useMemo(() => {
    if (!details?.event) return ""
    return formatMeetingTimeRange(details.event, locale)
  }, [details?.event, locale])

  const handleRegenerate = () => {
    startRegenerate(async () => {
      try {
        await regenerateMeetingAction({ meetingId, locale })
        toast.success("Regeneration requested")
        await queryClient.invalidateQueries({ queryKey })
      } catch (error) {
        console.error(error)
        toast.error("Failed to regenerate content")
      }
    })
  }

  const handlePublish = (postId: string) => {
    setPendingPostId(postId)
    ;(async () => {
      try {
        await publishSocialPostAction({ postId, meetingId, locale })
        toast.success("Post published")
        await queryClient.invalidateQueries({ queryKey })
      } catch (error) {
        console.error(error)
        toast.error("Failed to publish post")
      } finally {
        setPendingPostId(null)
      }
    })()
  }

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (query.error || !details) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        <Button variant="ghost" asChild>
          <Link href={`/${locale}/meetings`}>← Back to meetings</Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            Unable to load meeting details. Please try again later.
          </CardContent>
        </Card>
      </div>
    )
  }

  const event = details.event
  const insight = details.insight

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:py-14">
      <Button variant="ghost" className="w-fit" asChild>
        <Link href={`/${locale}/meetings`}>← Back to meetings</Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-3xl font-semibold">
              {event.title ?? "Untitled Meeting"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{rangeLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{formatPlatform(event.meetingPlatform)}</Badge>
              {event.calendarTitle && (
                <Badge variant="outline">{event.calendarTitle}</Badge>
              )}
              {details.recallBot?.status && (
                <Badge variant="outline">
                  Bot status: {details.recallBot.status.toLowerCase()}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {transcriptMedia && (
              <TranscriptViewer meetingId={meetingId} />
            )}
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="outline"
            >
              {isRegenerating ? "Regenerating..." : "Regenerate AI draft"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Follow-up email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insight?.followUpEmail ? (
              <>
                <Textarea
                  value={insight.followUpEmail}
                  readOnly
                  className="min-h-[240px] whitespace-pre-wrap"
                />
                <Button
                  variant="secondary"
                  onClick={() => copyToClipboard(insight.followUpEmail)}
                >
                  Copy email
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                AI follow-up email not available yet.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Meeting summary</CardTitle>
          </CardHeader>
          <CardContent>
            {insight?.summary ? (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {insight.summary}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Summary not available yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Social drafts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review AI-generated posts before publishing.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {drafts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No drafts available yet.
              </p>
            )}
            {drafts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-border/60 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{post.channel}</Badge>
                  <Badge variant="outline">{post.status.toLowerCase()}</Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {post.content}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(post.content)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    disabled={
                      pendingPostId === post.id || post.status === "POSTING"
                    }
                    onClick={() => handlePublish(post.id)}
                  >
                    {pendingPostId === post.id || post.status === "POSTING"
                      ? "Posting..."
                      : "Post"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Post history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No posts published for this meeting yet.
              </p>
            )}
            {history.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-border/60 p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{post.channel}</Badge>
                  <Badge
                    variant={post.status === "POSTED" ? "outline" : "destructive"}
                  >
                    {post.status.toLowerCase()}
                  </Badge>
                  {post.publishedAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleString(locale)}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {post.content}
                </p>
                {post.error && (
                  <p className="text-xs text-destructive">Error: {post.error}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function copyToClipboard(text: string) {
  if (!navigator?.clipboard) {
    toast.error("Clipboard not available")
    return
  }
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copied to clipboard"))
    .catch(() => toast.error("Failed to copy"))
}

function formatPlatform(platform: string) {
  switch (platform) {
    case "GOOGLE_MEET":
      return "Google Meet"
    case "MICROSOFT_TEAMS":
      return "Microsoft Teams"
    case "ZOOM":
      return "Zoom"
    default:
      return "Virtual"
  }
}

function TranscriptViewer({ meetingId }: { meetingId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [segments, setSegments] = useState<TranscriptSegment[]>([])

  const loadTranscript = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/meetings/${meetingId}/transcript`, {
        credentials: "include",
      })
      const data = (await response.json()) as { transcript?: unknown }
      setSegments(normalizeTranscript(data.transcript))
    } catch (error) {
      console.error(error)
      toast.error("Failed to load transcript")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next && segments.length === 0 && !loading) {
      loadTranscript()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">View transcript</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-3xl">
        <DialogHeader>
          <DialogTitle>Transcript</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading transcript…</p>
        ) : (
          <ScrollArea className="max-h-[60vh] space-y-4 pr-4">
            {segments.map((segment, index) => (
              <div key={`${segment.speaker}-${index}`}>
                <p className="text-sm font-medium">{segment.speaker}</p>
                <p className="text-sm text-muted-foreground">
                  {segment.text}
                </p>
                <Separator className="my-2" />
              </div>
            ))}
            {segments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Transcript not available yet.
              </p>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

type TranscriptSegment = {
  speaker: string
  text: string
}

function normalizeTranscript(payload: unknown): TranscriptSegment[] {
  if (!payload) {
    return []
  }

  if (Array.isArray(payload)) {
    return payload
      .map((segment) => segmentFromAny(segment))
      .filter((segment): segment is TranscriptSegment => Boolean(segment))
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    Array.isArray((payload as any).segments)
  ) {
    return ((payload as any).segments as unknown[])
      .map((segment) => segmentFromAny(segment))
      .filter((segment): segment is TranscriptSegment => Boolean(segment))
  }

  return [
    {
      speaker: "Transcript",
      text: JSON.stringify(payload, null, 2),
    },
  ]
}

function segmentFromAny(input: unknown): TranscriptSegment | null {
  if (!input || typeof input !== "object") {
    return null
  }
  const speaker =
    ((input as any)?.participant?.name as string | undefined) ??
    ((input as any)?.speaker as string | undefined) ??
    "Speaker"
  const text =
    ((input as any)?.text as string | undefined) ??
    ((input as any)?.message as string | undefined) ??
    ((input as any)?.body as string | undefined) ??
    joinWords((input as any)?.words)

  if (!text) {
    return null
  }

  return { speaker, text }
}

function joinWords(words: unknown): string | null {
  if (!Array.isArray(words)) {
    return null
  }
  const parts = words
    .map((word) => (word as any)?.text as string | undefined)
    .filter((value): value is string => Boolean(value))

  return parts.length ? parts.join(" ") : null
}

