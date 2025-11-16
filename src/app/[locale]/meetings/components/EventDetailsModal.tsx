"use client"

import { useMemo, useState, useTransition, useOptimistic } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  X,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Video as VideoIcon,
  Bot,
  Linkedin,
  Facebook,
  Share2,
  ExternalLink,
  AlertTriangle,
  ScrollText,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import Link from "next/link"
import type { CalendarEvent } from "@/features/calendar/types"
import { format } from "date-fns"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { regenerateContentAction } from "../actions/regenerateContent"
import { toggleNotetakerAction } from "@/features/calendar/actions/toggleNotetakerAction"
import { meetingDetailsKey } from "@/features/meetings/queries"
import { calendarEventsKey } from "@/features/calendar/queries"
import { ShareMeetingDialog } from "@/features/meetings/components/ShareMeetingDialog"
import { useMeetingDetails } from "@/features/meetings/hooks/useMeetingDetails"
import type { SocialPost as MeetingSocialPost } from "@/schemas/meetings/details"
import {
  getMeetingRecordingAction,
  getMeetingTranscriptAction,
} from "@/app/[locale]/meetings/[id]/actions"
import {
  parseTranscriptPayload,
  type TranscriptEntry,
} from "@/features/meetings/utils/transcript"
import { SocialDraftsSection } from "@/features/meetings/components/SocialDraftsSection"
import { SocialPostsHistorySection } from "@/features/meetings/components/SocialPostsHistorySection"
import { useConnectedAccountsCheck } from "@/features/meetings/hooks/useConnectedAccountsCheck"

type EventDetailsModalProps = {
  event: CalendarEvent
  locale: string
  userId: string
  onClose: () => void
}

const MeetingIcon = ({ platform }: { platform: string }) => {
  if (platform === "ZOOM") {
    return <Image src="/icons/Zoom.svg" alt="Zoom" width={18} height={18} />
  }
  if (platform === "MICROSOFT_TEAMS") {
    return <Image src="/icons/Teams.svg" alt="Teams" width={18} height={18} />
  }
  if (platform === "GOOGLE_MEET") {
    return <Image src="/icons/Meet.svg" alt="Meet" width={18} height={18} />
  }
  return null
}

function formatTimeRange(startTime?: string | null, endTime?: string | null) {
  if (!startTime) {
    return "N/A"
  }
  const formatSingle = (dateString: string) => {
    const date = new Date(dateString)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours < 12 ? "AM" : "PM"
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`
  }

  if (endTime) {
    return `${formatSingle(startTime)} - ${formatSingle(endTime)}`
  }

  return formatSingle(startTime)
}

export default function EventDetailsModal({
  event,
  locale,
  userId,
  onClose,
}: EventDetailsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [copiedTranscript, setCopiedTranscript] = useState(false)
  const [regeneratingEmail, setRegeneratingEmail] = useState(false)
  const [regeneratingSummary, setRegeneratingSummary] = useState(false)

  const { query: detailsQuery, details } = useMeetingDetails({
    meetingId: event.id,
    userId,
    locale,
  })
  const isDetailsLoading = detailsQuery.status === "pending"
  const detailsError =
    detailsQuery.error instanceof Error ? detailsQuery.error.message : null

  const followUpEmail = details?.insight?.followUpEmail ?? ""
  const meetingSummary = details?.insight?.summary ?? ""
  const socialPosts = details?.socialPosts ?? []

  const emailGenerated = Boolean(followUpEmail)
  const summaryGenerated = Boolean(meetingSummary)

  const { canPublish, isLoading: isLoadingAccounts } =
    useConnectedAccountsCheck(true)

  const queryClient = useQueryClient()
  const queryKey = meetingDetailsKey({ meetingId: event.id, userId, locale })

  const [optimisticNotetaker, toggleNotetaker] = useOptimistic(
    event.notetakerEnabled,
    (state, newValue: boolean) => newValue,
  )

  const [isTogglingNotetaker, startToggleNotetaker] = useTransition()

  const isCompleted = event.botStatus === "DONE"
  const isUpcoming = !event.endTime || new Date(event.endTime) > new Date()
  const canHaveNotetaker = !!event.meetingUrl && isUpcoming

  const aiEmail = followUpEmail
  const aiSummary = meetingSummary

  const mediaEntries = useMemo(() => details?.media ?? [], [details])
  const videoMediaAvailable = useMemo(
    () => mediaEntries.some((item) => item.type === "VIDEO" && item.available),
    [mediaEntries],
  )
  const transcriptMediaAvailable = useMemo(
    () =>
      mediaEntries.some((item) => item.type === "TRANSCRIPT" && item.available),
    [mediaEntries],
  )

  const {
    data: recording,
    isLoading: isRecordingLoading,
    isFetching: isRecordingFetching,
    error: recordingQueryError,
    refetch: refetchRecording,
  } = useQuery({
    queryKey: ["meeting-recording", event.id, "modal"],
    queryFn: () => getMeetingRecordingAction({ meetingId: event.id }),
    enabled: isCompleted && videoMediaAvailable,
    staleTime: 0,
  })

  const {
    data: transcriptPayload,
    isLoading: isTranscriptLoading,
    isFetching: isTranscriptFetching,
    error: transcriptQueryError,
    refetch: refetchTranscript,
  } = useQuery({
    queryKey: ["meeting-transcript", event.id, "modal"],
    queryFn: () => getMeetingTranscriptAction({ meetingId: event.id }),
    enabled: isCompleted && transcriptMediaAvailable,
    staleTime: 0,
  })

  const transcriptData = useMemo(
    () =>
      transcriptPayload ? parseTranscriptPayload(transcriptPayload) : null,
    [transcriptPayload],
  )
  const transcriptText = transcriptData?.plainText ?? null
  const transcriptEntries = transcriptData?.entries ?? []

  const recordingError =
    recordingQueryError instanceof Error
      ? recordingQueryError.message
      : recordingQueryError
        ? "Unable to load meeting recording"
        : null

  const transcriptError =
    transcriptQueryError instanceof Error
      ? transcriptQueryError.message
      : transcriptQueryError
        ? "Unable to load transcript"
        : null

  const handleCopy = (
    text: string | null | undefined,
    setCopied: (val: boolean) => void,
  ) => {
    if (!text) {
      return
    }
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyTranscript = () => {
    if (!transcriptText) {
      return
    }
    navigator.clipboard.writeText(transcriptText)
    setCopiedTranscript(true)
    setTimeout(() => setCopiedTranscript(false), 2000)
  }

  const handleRegenerate = async (type: "email" | "summary") => {
    const setters = {
      email: setRegeneratingEmail,
      summary: setRegeneratingSummary,
    }

    setters[type](true)
    try {
      await regenerateContentAction({
        meetingId: event.id,
        locale,
        contentType: type,
      })
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} regenerated`,
      )
      await queryClient.invalidateQueries({ queryKey })
    } catch (error) {
      console.error(error)
      toast.error(`Failed to regenerate ${type}`)
    } finally {
      setters[type](false)
    }
  }

  const handleToggleNotetaker = (enabled: boolean) => {
    toggleNotetaker(enabled)

    const loadingToastId = toast.loading(
      `${enabled ? "Enabling" : "Disabling"} notetaker...`,
      {
        position: "top-right",
      },
    )

    startToggleNotetaker(async () => {
      try {
        await toggleNotetakerAction({
          eventId: event.id,
          enabled,
          locale,
        })
        // Invalidate calendar queries to refresh event data
        await queryClient.invalidateQueries({
          queryKey: calendarEventsKey({ userId, locale }),
        })
        await queryClient.invalidateQueries({ queryKey })

        // Dismiss loading toast and show success
        toast.dismiss(loadingToastId)
        toast.success(
          `Notetaker ${enabled ? "enabled" : "disabled"} successfully`,
          {
            position: "top-right",
          },
        )
      } catch (error) {
        console.error("Failed to toggle notetaker", error)
        toggleNotetaker(!enabled) // Revert optimistic update

        // Dismiss loading toast and show error
        toast.dismiss(loadingToastId)
        toast.error(
          `Failed to ${enabled ? "enable" : "disable"} notetaker. ${
            error instanceof Error ? error.message : "Please try again."
          }`,
          {
            position: "top-right",
          },
        )
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3), rgba(6, 182, 212, 0.2), rgba(0, 0, 0, 0.7))",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/15 bg-linear-to-br from-purple-900/35 via-[#0c0715]/95 to-cyan-900/15 shadow-[0_40px_140px_rgba(0,0,0,0.65)] backdrop-blur-3xl max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/5/40 px-6 py-5 backdrop-blur-2xl">
          <div className="flex-1 min-w-0">
            <Link
              href={`/${locale}/meetings/${event.id}`}
              className="mb-2 block text-2xl font-bold text-white transition-colors hover:text-purple-300"
            >
              {event.title || "Untitled Event"}
            </Link>
            <div className="mt-3 flex flex-wrap gap-3 lg:flex-nowrap">
              <div className="flex min-w-[180px] flex-1 flex-col rounded-2xl border border-white/10 bg-white/5/30 px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Time
                </span>
                <span className="mt-1 text-base font-medium text-gray-100">
                  {formatTimeRange(event.startTime, event.endTime)}
                </span>
              </div>
              <div className="flex min-w-[180px] flex-1 flex-col rounded-2xl border border-white/10 bg-white/5/30 px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Date
                </span>
                <span className="mt-1 text-base font-medium text-gray-100">
                  {format(new Date(event.startTime), "MMM d, yyyy")}
                </span>
              </div>
              {event.meetingPlatform && event.meetingPlatform !== "UNKNOWN" && (
                <div className="flex min-w-[200px] flex-1 flex-col rounded-2xl border border-white/10 bg-white/5/30 px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Platform
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-base font-medium text-gray-100">
                    <MeetingIcon platform={event.meetingPlatform} />
                    <span>{event.meetingPlatform.replace("_", " ")}</span>
                  </div>
                </div>
              )}
              {event.botStatus && (
                <div className="flex min-w-[160px] flex-1 flex-col rounded-2xl border border-white/10 bg-white/5/30 px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Status
                  </span>
                  <Badge
                    variant="secondary"
                    className="mt-1 w-fit border-0 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white"
                  >
                    {event.botStatus}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {event.meetingUrl && (
              <Button
                asChild
                size="sm"
                className="gap-2 rounded-full border border-white/20 bg-white/5 text-white/90 hover:bg-white/10"
              >
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Meeting
                </a>
              </Button>
            )}
            <ShareMeetingDialog
              meetingId={event.id}
              locale={locale}
              meetingTitle={event.title}
              canManage
              trigger={
                <button
                  type="button"
                  className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:bg-white/10"
                >
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              }
            />
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:bg-white/10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-linear-to-b from-transparent via-white/5/10 to-transparent p-6 space-y-6">
          {/* Notetaker Toggle - Only for upcoming events with meeting URL */}
          {canHaveNotetaker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl border border-purple-500/40 bg-linear-to-br from-purple-600/20 via-transparent to-cyan-500/20 p-[1.5px] shadow-[0_20px_80px_rgba(109,40,217,0.45)]"
            >
              <div className="rounded-[26px] bg-[#05060a]/80 p-5 backdrop-blur-2xl">
                {isTogglingNotetaker ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/40 bg-linear-to-br from-purple-500/30 via-transparent to-cyan-500/30">
                        <Bot className="h-5 w-5 text-purple-300 animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-8 animate-pulse rounded bg-white/10" />
                      <div className="h-6 w-11 animate-pulse rounded-full bg-white/10" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/40 bg-linear-to-br from-purple-500/20 via-transparent to-cyan-500/20">
                        <Bot
                          className={`w-5 h-5 transition-colors ${
                            optimisticNotetaker
                              ? "text-purple-400"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200">
                          AI Notetaker
                        </p>
                        <p className="text-xs text-gray-400">
                          {optimisticNotetaker
                            ? "Bot will join and record the meeting"
                            : "Bot will not join the meeting"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-medium transition-colors ${
                          optimisticNotetaker
                            ? "text-purple-400"
                            : "text-gray-500"
                        }`}
                      >
                        {optimisticNotetaker ? "ON" : "OFF"}
                      </span>
                      <Switch
                        checked={optimisticNotetaker}
                        onCheckedChange={handleToggleNotetaker}
                        disabled={isTogglingNotetaker}
                        className="data-[state=checked]:bg-linear-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {detailsError && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              Unable to load AI content: {detailsError}
            </div>
          )}

          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl border border-white/10 bg-linear-to-br from-purple-500/15 via-transparent to-cyan-500/15 p-[1.5px] shadow-[0_25px_80px_rgba(99,102,241,0.35)]"
            >
              <div className="overflow-hidden rounded-[26px] bg-[#04070e]/90">
                <div className="relative flex aspect-video items-center justify-center bg-black/60">
                  {!videoMediaAvailable ? (
                    <p className="px-6 text-center text-sm text-gray-400">
                      Recording isn&apos;t available for this meeting yet.
                    </p>
                  ) : isRecordingLoading || isRecordingFetching ? (
                    <div className="space-y-3 text-center text-gray-300">
                      <VideoIcon className="mx-auto h-10 w-10 animate-pulse text-purple-300" />
                      <p>Fetching latest recording…</p>
                    </div>
                  ) : recordingError ? (
                    <div className="space-y-3 text-center">
                      <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
                      <p className="text-sm text-red-200">{recordingError}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void refetchRecording()}
                        className="text-white/80"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Retry
                      </Button>
                    </div>
                  ) : recording?.downloadUrl ? (
                    <video
                      key={recording.downloadUrl}
                      controls
                      className="h-full w-full"
                      poster="/meeting-recording-thumbnail.jpg"
                    >
                      <source src={recording.downloadUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="space-y-3 text-center text-gray-300">
                      <VideoIcon className="mx-auto h-10 w-10 text-gray-500" />
                      <p className="text-sm text-gray-400">
                        Recording is still processing.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-6 py-4 text-sm text-gray-300">
                  <div>
                    <p className="font-medium text-white/90">
                      Meeting Recording
                    </p>
                    {recording?.expiresAt && (
                      <p className="text-xs text-gray-500">
                        Link expires{" "}
                        {new Date(recording.expiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void refetchRecording()}
                    disabled={
                      !videoMediaAvailable ||
                      isRecordingLoading ||
                      isRecordingFetching
                    }
                    className="gap-2 text-white/80 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRecordingLoading || isRecordingFetching
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5/10 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.55)]"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-purple-300" />
                  <span className="text-sm font-semibold text-gray-100">
                    Transcript
                  </span>
                  <Badge variant="outline" className="text-white/80">
                    {transcriptMediaAvailable ? "Available" : "Pending"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void refetchTranscript()}
                    disabled={
                      !transcriptMediaAvailable ||
                      isTranscriptLoading ||
                      isTranscriptFetching
                    }
                    className="gap-2 rounded-full border border-white/10 text-white/80 hover:bg-white/10 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isTranscriptLoading || isTranscriptFetching
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyTranscript}
                    disabled={!transcriptText}
                    className="gap-2 rounded-full border-white/20 bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50"
                  >
                    {copiedTranscript ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedTranscript ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-200">
                {!transcriptMediaAvailable ? (
                  <p className="text-sm text-gray-400">
                    Transcript will appear once the bot finishes uploading the
                    recording.
                  </p>
                ) : isTranscriptLoading || isTranscriptFetching ? (
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className="h-4 w-full rounded bg-white/10"
                      />
                    ))}
                  </div>
                ) : transcriptError ? (
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{transcriptError}</span>
                  </div>
                ) : transcriptEntries.length ? (
                  <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
                    {transcriptEntries.map((entry, index) => {
                      const alignRight = index % 2 === 1
                      return (
                        <div
                          key={`${entry.speaker}-${index}-${entry.timestamp ?? index}`}
                          className={`flex ${alignRight ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-lg ${
                              alignRight
                                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
                                : "border-white/15 bg-white/5 text-gray-100"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wide text-white/60">
                              <span className="font-semibold">
                                {entry.speaker}
                              </span>
                              {entry.timestamp && (
                                <span className="text-white/40">
                                  {new Date(entry.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                              {entry.text}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Transcript not available yet.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* AI Follow-up Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-2xl border p-6 shadow-[0_20px_80px_rgba(15,23,42,0.55)] ${
              isCompleted
                ? "border-white/15 bg-linear-to-br from-purple-500/10 via-white/5/20 to-cyan-500/5"
                : "border-white/10 bg-white/5/15"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles
                  className={`h-4 w-4 ${isCompleted ? "text-purple-300" : "text-gray-500"}`}
                />
                <span className="text-sm font-semibold text-gray-100">
                  AI-Written Follow-up Email
                </span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${emailGenerated ? "bg-white/10 text-white" : "bg-white/5 text-gray-300"}`}
                >
                  {emailGenerated
                    ? "Generated"
                    : isCompleted
                      ? "Pending"
                      : "Scheduled"}
                </Badge>
              </div>
              {isCompleted && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRegenerate("email")}
                    disabled={regeneratingEmail}
                    className="gap-2 rounded-full border border-white/10 bg-transparent text-white/80 hover:bg-white/10"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${regeneratingEmail ? "animate-spin" : ""}`}
                    />
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(aiEmail, setCopiedEmail)}
                    disabled={!emailGenerated}
                    className="gap-2 rounded-full border-white/20 bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedEmail ? "Copied!" : "Copy"}
                  </Button>
                </div>
              )}
            </div>
            <div
              className={`rounded-xl border p-4 text-sm ${
                isCompleted
                  ? "border-white/10 bg-[#05060a]/80 text-gray-200 whitespace-pre-wrap font-mono"
                  : "border-white/5 bg-[#05060a]/40 text-gray-500"
              }`}
            >
              {isCompleted ? (
                isDetailsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-white/10" />
                    <div className="h-4 w-full rounded bg-white/10" />
                    <div className="h-4 w-2/3 rounded bg-white/10" />
                  </div>
                ) : detailsError ? (
                  <p className="text-sm text-red-300">
                    Unable to load follow-up email. Try refreshing.
                  </p>
                ) : emailGenerated ? (
                  aiEmail
                ) : (
                  <p className="text-sm text-gray-400">
                    AI follow-up email not available yet.
                  </p>
                )
              ) : (
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                  <p className="mt-4 text-center text-xs text-gray-500">
                    AI will generate follow-up email after meeting completion
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Meeting Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl border p-6 shadow-[0_20px_80px_rgba(15,23,42,0.55)] ${
              isCompleted
                ? "border-white/15 bg-linear-to-br from-cyan-500/10 via-white/5/15 to-purple-500/10"
                : "border-white/10 bg-white/5/15"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles
                  className={`h-4 w-4 ${isCompleted ? "text-cyan-300" : "text-gray-500"}`}
                />
                <span className="text-sm font-semibold text-gray-100">
                  AI-Written Meeting Summary
                </span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${summaryGenerated ? "bg-white/10 text-white" : "bg-white/5 text-gray-300"}`}
                >
                  {summaryGenerated
                    ? "Generated"
                    : isCompleted
                      ? "Pending"
                      : "Scheduled"}
                </Badge>
              </div>
              {isCompleted && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRegenerate("summary")}
                    disabled={regeneratingSummary}
                    className="gap-2 rounded-full border border-white/10 bg-transparent text-white/80 hover:bg-white/10"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${regeneratingSummary ? "animate-spin" : ""}`}
                    />
                    Regenerate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(aiSummary, setCopiedSummary)}
                    disabled={!summaryGenerated}
                    className="gap-2 rounded-full border-white/20 bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50"
                  >
                    {copiedSummary ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedSummary ? "Copied!" : "Copy"}
                  </Button>
                </div>
              )}
            </div>
            <div
              className={`rounded-xl border p-4 text-sm ${
                isCompleted
                  ? "border-white/10 bg-[#05060a]/80 text-gray-200 whitespace-pre-wrap"
                  : "border-white/5 bg-[#05060a]/40 text-gray-500"
              }`}
            >
              {isCompleted ? (
                isDetailsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-white/10" />
                    <div className="h-4 w-full rounded bg-white/10" />
                    <div className="h-4 w-4/5 rounded bg-white/10" />
                  </div>
                ) : detailsError ? (
                  <p className="text-sm text-red-300">
                    Unable to load meeting summary. Try refreshing.
                  </p>
                ) : summaryGenerated ? (
                  aiSummary
                ) : (
                  <p className="text-sm text-gray-400">
                    Summary not available yet.
                  </p>
                )
              ) : (
                <div className="space-y-2">
                  <div className="h-4 w-2/3 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                  <p className="mt-4 text-center text-xs text-gray-500">
                    AI will generate meeting summary after completion
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Social Drafts */}
          {isCompleted && (
            <SocialDraftsSection
              posts={details?.socialPosts ?? []}
              meetingId={event.id}
              locale={locale}
              isAuthorized={true}
              canPublish={canPublish}
              isLoadingAccounts={isLoadingAccounts}
              onRefresh={() => detailsQuery.refetch()}
              variant="modal"
            />
          )}

          <SocialPostsHistorySection
            posts={details?.socialPosts ?? []}
            isAuthorized={true}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

function ModalSocialPostsHistory({ posts }: { posts: MeetingSocialPost[] }) {
  // This function is no longer used, but kept for backwards compatibility
  return null
}
