"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ChangeEvent, ReactNode } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
  Sparkles,
  FileText,
  Linkedin,
  Facebook,
  Lock,
  Check,
  CheckCheck,
  Clock3,
  AlertCircle,
  Copy,
  RefreshCw,
  Send,
  MessageCircle,
  User,
  Loader2,
  ScrollText,
  AlertTriangle,
  Video as VideoIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/forms/apiError"
import { cn } from "@/lib/utils"
import { ShareMeetingDialog } from "@/features/meetings/components/ShareMeetingDialog"
import { useMeetingActivity } from "@/features/meetings/hooks/useMeetingActivity"
import type { MeetingActivity } from "@/schemas/meetings/details"
import type { MeetingChatMessage } from "@/schemas/meetings/chat"
import { useMeetingChatSocket } from "@/features/meetings/chat/hooks/useMeetingChatSocket"
import {
  getMeetingRecordingAction,
  getMeetingTranscriptAction,
  getMeetingChatHistoryAction,
} from "@/app/[locale]/meetings/[id]/actions"
import type { MeetingRecordingResponse } from "@/features/meetings/api"
import {
  parseTranscriptPayload,
  type TranscriptEntry,
} from "@/features/meetings/utils/transcript"
import { SocialDraftsSection } from "@/features/meetings/components/SocialDraftsSection"
import { SocialPostsHistorySection } from "@/features/meetings/components/SocialPostsHistorySection"
import { useConnectedAccountsCheck } from "@/features/meetings/hooks/useConnectedAccountsCheck"

type MeetingActivityClientProps = {
  meetingId: string
  locale: string
  viewer: {
    id: string | null
    email: string | null
    name: string | null
    initialAccess?: AccessState
  }
}

type AccessState =
  | "authorized"
  | "unauthenticated"
  | "forbidden"
  | "loading"
  | "idle"

type MeetingChatMessageWithMeta = MeetingChatMessage & {
  status?: "pending" | "failed"
}

const sortChatMessages = (
  messages: MeetingChatMessageWithMeta[],
): MeetingChatMessageWithMeta[] =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

export default function MeetingActivityClient({
  meetingId,
  locale,
  viewer,
}: MeetingActivityClientProps) {
  const [chatMessages, setChatMessages] = useState<
    MeetingChatMessageWithMeta[]
  >([])
  const [chatCursor, setChatCursor] = useState<string | null>(null)
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [isLoadingMoreChat, setIsLoadingMoreChat] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const typingTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({})
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})
  const [newMessage, setNewMessage] = useState("")
  const [participantCount, setParticipantCount] = useState(0)

  const { query, activity } = useMeetingActivity({
    meetingId,
    viewerId: viewer.id ?? undefined,
    enabled: Boolean(viewer.id),
  })
  const { canPublish, isLoading: isLoadingAccounts } =
    useConnectedAccountsCheck(Boolean(viewer.id))

  const accessState = useAccessState({
    viewer,
    queryStatus: query.status,
    queryError: query.error,
    hasData: Boolean(activity),
  })

  const isAuthorized = accessState === "authorized" && Boolean(activity)
  const canManageShares = activity?.viewerRole === "owner"

  const display = useActivityDisplay(activity, locale)

  const refreshActivity = useCallback(async () => {
    await query.refetch()
  }, [query])

  const mediaEntries = activity?.details.media ?? []

  const videoMedia = useMemo(
    () =>
      mediaEntries.find(
        (item) => item.type === "VIDEO" && item.available === true,
      ),
    [mediaEntries],
  )

  const transcriptMedia = useMemo(
    () =>
      mediaEntries.find(
        (item) => item.type === "TRANSCRIPT" && item.available === true,
      ),
    [mediaEntries],
  )

  const hasVideoMedia = Boolean(videoMedia)
  const hasTranscriptMedia = Boolean(transcriptMedia)

  const {
    data: recording,
    isLoading: isRecordingLoading,
    isFetching: isRecordingFetching,
    error: recordingQueryError,
    refetch: refetchRecording,
  } = useQuery({
    queryKey: ["meeting-recording", meetingId],
    queryFn: () => getMeetingRecordingAction({ meetingId }),
    enabled: isAuthorized && hasVideoMedia,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: transcriptPayload,
    isLoading: isTranscriptLoading,
    isFetching: isTranscriptFetching,
    error: transcriptQueryError,
    refetch: refetchTranscript,
  } = useQuery({
    queryKey: ["meeting-transcript", meetingId],
    queryFn: () => getMeetingTranscriptAction({ meetingId }),
    enabled: isAuthorized && hasTranscriptMedia,
    staleTime: 5 * 60 * 1000,
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
        ? "Unable to load transcript yet"
        : null

  useEffect(() => {
    if (!isAuthorized) {
      setChatMessages([])
      setChatCursor(null)
      setChatError(null)
      setParticipantCount(0)
      return
    }
    let cancelled = false
    setIsLoadingChat(true)
    setChatError(null)
    getMeetingChatHistoryAction({ meetingId, limit: 40 })
      .then((history) => {
        if (cancelled) return
        setChatMessages(
          sortChatMessages(history.messages.map((message) => ({ ...message }))),
        )
        setChatCursor(history.nextCursor)
      })
      .catch((error) => {
        if (cancelled) return
        setChatError(
          error instanceof Error
            ? error.message
            : "Unable to load chat history",
        )
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingChat(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [isAuthorized, meetingId])

  const appendMessage = useCallback((message: MeetingChatMessage) => {
    setChatMessages((prev) => {
      const incoming: MeetingChatMessageWithMeta = { ...message }
      if (incoming.clientMessageId) {
        const index = prev.findIndex(
          (item) => item.clientMessageId === incoming.clientMessageId,
        )
        if (index !== -1) {
          const clone = [...prev]
          clone[index] = { ...clone[index], ...incoming, status: undefined }
          return clone
        }
      }
      const exists = prev.some((item) => item.id === incoming.id)
      if (exists) {
        return prev
      }
      return sortChatMessages([...prev, incoming])
    })
  }, [])

  const updateReadReceipts = useCallback(
    (updates: { messageId: string; readBy: string[] }[]) => {
      if (!updates.length) {
        return
      }
      setChatMessages((prev) =>
        prev.map((message) => {
          const found = updates.find(
            (update) => update.messageId === message.id,
          )
          if (!found) {
            return message
          }
          return { ...message, readBy: found.readBy }
        }),
      )
    },
    [],
  )

  const handleTypingEvent = useCallback(
    (payload: { userId: string; name: string }) => {
      if (!payload.userId || payload.userId === viewer.id) {
        return
      }
      setTypingUsers((prev) => ({
        ...prev,
        [payload.userId]: payload.name || "Someone",
      }))
      if (typingTimeoutsRef.current[payload.userId]) {
        clearTimeout(typingTimeoutsRef.current[payload.userId])
      }
      typingTimeoutsRef.current[payload.userId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev }
          delete next[payload.userId]
          return next
        })
        delete typingTimeoutsRef.current[payload.userId]
      }, 3000)
    },
    [viewer.id],
  )

  useEffect(() => {
    return () => {
      Object.values(typingTimeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout)
      })
      typingTimeoutsRef.current = {}
    }
  }, [])

  const handleChatError = useCallback(
    (payload: { message: string; clientMessageId?: string }) => {
      setChatError(payload.message)
      if (payload.clientMessageId) {
        setChatMessages((prev) =>
          prev.map((message) =>
            message.clientMessageId === payload.clientMessageId
              ? { ...message, status: "failed" }
              : message,
          ),
        )
      }
    },
    [],
  )

  const handlePresenceUpdate = useCallback((payload: { userCount: number }) => {
    setParticipantCount(payload.userCount)
  }, [])

  const renderMessageStatus = useCallback(
    (message: MeetingChatMessageWithMeta) => {
      if (message.status === "failed") {
        return (
          <>
            <AlertCircle className="h-3 w-3 text-red-400" />
            <span className="text-red-300">Failed</span>
          </>
        )
      }
      if (message.status === "pending") {
        return (
          <>
            <Clock3 className="h-3 w-3 text-gray-400 animate-pulse" />
            <span>Sending…</span>
          </>
        )
      }
      const readers = message.readBy.filter(
        (readerId) => readerId !== message.senderId,
      )
      if (readers.length > 0) {
        const seenLabel =
          readers.length === 1 ? "Seen" : `Seen by ${readers.length}`
        return (
          <>
            <CheckCheck className="h-3 w-3 text-emerald-400" />
            <span>{seenLabel}</span>
          </>
        )
      }
      return (
        <>
          <Check className="h-3 w-3 text-gray-300" />
          <span>Sent</span>
        </>
      )
    },
    [],
  )

  const {
    connected: isChatConnected,
    sendMessage: sendChatMessage,
    emitTyping: emitChatTyping,
    markMessagesRead: markChatMessagesRead,
  } = useMeetingChatSocket({
    meetingId,
    enabled: isAuthorized,
    onMessage: appendMessage,
    onTyping: handleTypingEvent,
    onRead: updateReadReceipts,
    onPresence: handlePresenceUpdate,
    onError: handleChatError,
  })

  useEffect(() => {
    if (!isAuthorized || !viewer.id || chatMessages.length === 0) {
      return
    }
    const unread = chatMessages
      .filter(
        (message) =>
          message.status !== "pending" && !message.readBy.includes(viewer.id!),
      )
      .map((message) => message.id)
    if (unread.length) {
      markChatMessagesRead(unread)
    }
  }, [chatMessages, isAuthorized, markChatMessagesRead, viewer.id])

  const loadOlderMessages = useCallback(async () => {
    if (!chatCursor || isLoadingMoreChat) {
      return
    }
    setIsLoadingMoreChat(true)
    try {
      const history = await getMeetingChatHistoryAction({
        meetingId,
        before: chatCursor,
        limit: 30,
      })
      setChatMessages((prev) => {
        const merged = new Map<string, MeetingChatMessageWithMeta>()
        history.messages.forEach((message) =>
          merged.set(message.id, { ...message }),
        )
        prev.forEach((message) => merged.set(message.id, message))
        return sortChatMessages(Array.from(merged.values()))
      })
      setChatCursor(history.nextCursor)
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Unable to load additional messages",
      )
    } finally {
      setIsLoadingMoreChat(false)
    }
  }, [chatCursor, isLoadingMoreChat, meetingId])

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(event.target.value)
    emitChatTyping()
  }

  const handleSendMessage = () => {
    if (!isAuthorized || !viewer.id) {
      return
    }
    const trimmed = newMessage.trim()
    if (!trimmed) {
      return
    }
    const clientMessageId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `temp-${Date.now()}`
    const optimisticMessage: MeetingChatMessageWithMeta = {
      id: clientMessageId,
      meetingId,
      senderId: viewer.id,
      senderName: viewer.name ?? "You",
      body: trimmed,
      createdAt: new Date().toISOString(),
      readBy: viewer.id ? [viewer.id] : [],
      clientMessageId,
      status: "pending",
    }
    setChatMessages((prev) => sortChatMessages([...prev, optimisticMessage]))
    sendChatMessage(trimmed, { clientMessageId })
    setNewMessage("")
    setChatError(null)
  }

  const typingNames = Object.values(typingUsers)
  const showChatPanel = isAuthorized
  const mainColumnSpan = showChatPanel ? "lg:col-span-2" : "lg:col-span-3"

  return (
    <div className="min-h-screen bg-[#0a0b0f] relative overflow-hidden">
      <AnimatedBackground />

      <AnimatePresence>
        {accessState !== "authorized" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6 text-center"
          >
            <div className="max-w-md space-y-4 rounded-2xl border border-white/20 bg-black/70 p-6 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold text-white">
                {accessState === "forbidden"
                  ? "You're not allowed to view this meeting"
                  : "Connect to our app to unlock this meeting"}
              </h2>
              <p className="text-sm text-gray-300">
                {accessState === "forbidden"
                  ? "Ask the meeting owner to share access with your email."
                  : "Sign in or create an account with your work email to view this event and its AI content."}
              </p>
              {accessState !== "forbidden" && (
                <Button
                  size="lg"
                  asChild
                  className="w-full justify-center bg-linear-to-r from-purple-600 to-cyan-600 text-white shadow-lg"
                >
                  <Link href={`/${locale}/signup`}>
                    <Lock className="mr-2 h-5 w-5" />
                    Connect to Our App
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "relative z-10 min-h-screen",
          !isAuthorized && "pointer-events-none select-none blur-md",
        )}
      >
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <Button variant="ghost" asChild>
                <Link href={`/${locale}/meetings`}>← Back to Calendar</Link>
              </Button>
              <div className="flex items-center gap-3">
                {isAuthorized && (
                  <Badge className="bg-green-600">Authorized</Badge>
                )}
                <ShareMeetingDialog
                  meetingId={meetingId}
                  locale={locale}
                  meetingTitle={display.title}
                  canManage={canManageShares ?? false}
                  trigger={
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/30 bg-white/5 text-white hover:bg-white/10"
                      disabled={!viewer.id}
                    >
                      Share meeting
                    </Button>
                  }
                />
              </div>
            </div>

            {accessState === "forbidden" && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                Sorry, you&apos;re not allowed to see this meeting. Ask the
                meeting owner to invite you.
              </div>
            )}

            <h1
              className={`text-5xl font-bold mb-4 bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent ${
                !isAuthorized && "blur-sm select-none"
              }`}
            >
              {isAuthorized ? display.title : "Meeting Title Hidden"}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-400">
              <div className={!isAuthorized ? "blur-sm select-none" : ""}>
                {display.timeLabel} • {display.durationLabel}
              </div>
              <div className={!isAuthorized ? "blur-sm select-none" : ""}>
                {display.dateLabel}
              </div>
              <div className={!isAuthorized ? "blur-sm select-none" : ""}>
                {display.ownerLabel}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={cn("space-y-8", mainColumnSpan)}>
              <VideoSection
                authorized={isAuthorized}
                hasRecording={hasVideoMedia}
                isLoading={isRecordingLoading || isRecordingFetching}
                error={recordingError}
                recording={recording ?? null}
                onRetry={() => {
                  if (hasVideoMedia) {
                    void refetchRecording()
                  }
                }}
              />
              <TranscriptSection
                authorized={isAuthorized}
                hasTranscript={hasTranscriptMedia}
                transcriptText={transcriptText}
                transcriptEntries={transcriptEntries}
                isLoading={isTranscriptLoading || isTranscriptFetching}
                error={transcriptError}
                onRetry={() => {
                  if (hasTranscriptMedia) {
                    void refetchTranscript()
                  }
                }}
              />
              <AiSection
                title="AI Follow-up Email"
                icon={<Sparkles className="w-5 h-5 text-purple-400" />}
                content={
                  isAuthorized
                    ? (display.emailCopy ??
                      "AI follow-up email not available yet.")
                    : "Content hidden until authorized"
                }
                generated={Boolean(activity?.details.insight?.followUpEmail)}
                isAuthorized={isAuthorized}
              />
              <AiSection
                title="Meeting Summary"
                icon={<FileText className="w-5 h-5 text-purple-400" />}
                content={
                  isAuthorized
                    ? (display.summaryCopy ?? "Summary not available yet.")
                    : "Content hidden until authorized"
                }
                generated={Boolean(activity?.details.insight?.summary)}
                isAuthorized={isAuthorized}
              />
              <SocialDraftsSection
                posts={activity?.details.socialPosts ?? []}
                meetingId={meetingId}
                locale={locale}
                isAuthorized={isAuthorized}
                canPublish={canPublish}
                isLoadingAccounts={isLoadingAccounts}
                onRefresh={refreshActivity}
                variant="page"
              />
              <SocialPostsHistorySection
                posts={activity?.details.socialPosts ?? []}
                isAuthorized={isAuthorized}
              />
            </div>

            {showChatPanel && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-1"
              >
                <div className="glass-card bg-[#252830]/50 backdrop-blur-xl rounded-xl border border-gray-800/50 sticky top-6 h-[calc(100vh-120px)] flex flex-col">
                  <div className="p-4 border-b border-gray-800/50">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-gray-200">
                        Discussion
                      </h3>
                      {isAuthorized && (
                        <div className="ml-auto mr-2 flex items-center gap-2 text-xs">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isChatConnected ? "bg-emerald-400" : "bg-gray-400"
                            }`}
                          />
                          <span
                            className={
                              isChatConnected
                                ? "text-emerald-300"
                                : "text-gray-400"
                            }
                          >
                            {isChatConnected ? "Live" : "Connecting"}
                          </span>
                        </div>
                      )}
                      <Badge
                        variant="secondary"
                        className="bg-white/5 text-gray-100 border-white/10"
                        title="People currently in this chat"
                      >
                        {participantCount} online
                      </Badge>
                    </div>
                  </div>

                  <div
                    className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                      !isAuthorized && "blur-md pointer-events-none"
                    }`}
                  >
                    {chatCursor && isAuthorized && (
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadOlderMessages}
                          disabled={isLoadingMoreChat}
                          className="text-xs text-purple-200 hover:text-white"
                        >
                          {isLoadingMoreChat ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Load earlier messages"
                          )}
                        </Button>
                      </div>
                    )}
                    {isLoadingChat ? (
                      <div className="space-y-4">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 animate-pulse text-white/10"
                          >
                            <div className="h-10 w-10 rounded-full bg-white/10" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-1/3 rounded-full bg-white/10" />
                              <div className="h-4 w-full rounded-full bg-white/10" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-400">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isOwnMessage = viewer.id === msg.senderId
                        const timestamp = new Date(msg.createdAt)
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${
                              isOwnMessage ? "flex-row-reverse text-right" : ""
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${
                                isOwnMessage
                                  ? "bg-linear-to-br from-purple-500 to-cyan-500"
                                  : "bg-[#1a1d24]"
                              }`}
                            >
                              {initialsFromName(msg.senderName)}
                            </div>
                            <div className="flex-1">
                              <div
                                className={`flex items-baseline gap-2 mb-1 ${
                                  isOwnMessage ? "justify-end" : ""
                                }`}
                              >
                                <span className="text-sm font-semibold text-gray-200">
                                  {isOwnMessage ? "You" : msg.senderName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div
                                className={`rounded-lg p-3 text-sm ${
                                  isOwnMessage
                                    ? "bg-linear-to-r from-purple-600/40 to-cyan-600/30 text-white"
                                    : "bg-[#1a1d24] text-gray-300"
                                }`}
                              >
                                {msg.body}
                              </div>
                              {isOwnMessage && (
                                <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-gray-400">
                                  {renderMessageStatus(msg)}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>

                  {typingNames.length > 0 && isAuthorized && (
                    <div className="px-4 pb-2 text-xs text-purple-200/80">
                      {typingNames.join(", ")}{" "}
                      {typingNames.length > 1 ? "are" : "is"} typing...
                    </div>
                  )}

                  {chatError && isAuthorized && (
                    <div className="px-4 text-xs text-red-300">{chatError}</div>
                  )}

                  <div
                    className={`p-4 border-t border-gray-800/50 ${
                      !isAuthorized && "blur-md pointer-events-none"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Textarea
                          value={newMessage}
                          onChange={handleMessageChange}
                          placeholder={
                            isAuthorized
                              ? "Type a message..."
                              : "Connect to chat"
                          }
                          className="bg-[#1a1d24] border-gray-700 text-gray-300 resize-none"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          disabled={!isAuthorized || !isChatConnected}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={
                            !newMessage.trim() ||
                            !isAuthorized ||
                            !isChatConnected
                          }
                          className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      {!isChatConnected && isAuthorized && (
                        <p className="text-xs text-gray-500">
                          Connecting to the live chat…
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-600/8 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

function VideoSection({
  authorized,
  hasRecording,
  recording,
  isLoading,
  error,
  onRetry,
}: {
  authorized: boolean
  hasRecording: boolean
  recording: MeetingRecordingResponse | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) {
  const canPlay = Boolean(authorized && recording?.downloadUrl)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative"
    >
      <div className="glass-card border border-purple-500/30 backdrop-blur-xl bg-linear-to-br from-purple-900/20 via-[#252830] to-cyan-900/20 rounded-xl p-1">
        <div className="bg-[#1a1d24] rounded-lg overflow-hidden transition-all duration-500">
          <div className="relative aspect-video bg-black/60">
            {!authorized && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 text-white">
                <Lock className="h-8 w-8" />
                <p className="text-sm text-gray-300">
                  Sign in to watch the recording
                </p>
              </div>
            )}

            {authorized && canPlay && (
              <video
                key={recording?.downloadUrl}
                controls
                className="h-full w-full"
                poster="/meeting-recording-thumbnail.jpg"
              >
                <source src={recording?.downloadUrl} type="video/mp4" />
              </video>
            )}

            {authorized && !canPlay && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-300">
                {isLoading ? (
                  <div className="space-y-3 text-center">
                    <VideoIcon className="mx-auto h-10 w-10 animate-pulse text-purple-300" />
                    <p>Fetching latest recording…</p>
                  </div>
                ) : error ? (
                  <div className="space-y-3 text-center">
                    <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
                    <p className="text-sm text-red-200">{error}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onRetry}
                      className="text-white/80"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                ) : hasRecording ? (
                  <div className="space-y-3 text-center">
                    <VideoIcon className="mx-auto h-10 w-10 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      Recording is available. Load it to watch.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onRetry}
                      className="text-white/80"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Load recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 text-center">
                    <VideoIcon className="mx-auto h-10 w-10 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      Recording will appear once Recall finishes processing.
                    </p>
                  </div>
                )}
              </div>
            )}

            {authorized && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Badge className="border-0 bg-red-500/90 text-white">
                  ● Recording
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onRetry}
                  disabled={isLoading}
                  className="rounded-full border border-white/10 bg-black/30 text-white hover:bg-white/10"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-gray-800/50 bg-[#252830] px-4 py-3 text-sm text-gray-300">
            <span>Meeting Recording</span>
            {recording?.expiresAt && (
              <span className="text-xs text-gray-500">
                Expires {new Date(recording.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TranscriptSection({
  authorized,
  hasTranscript,
  transcriptText,
  transcriptEntries,
  isLoading,
  error,
  onRetry,
}: {
  authorized: boolean
  hasTranscript: boolean
  transcriptText: string | null
  transcriptEntries: TranscriptEntry[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) {
  const [copied, setCopied] = useState(false)
  const canCopy = Boolean(transcriptText)

  const handleCopyTranscript = () => {
    if (!transcriptText) {
      return
    }
    navigator.clipboard.writeText(transcriptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="glass-card rounded-xl border border-gray-800/60 bg-[#11131a]/80 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-purple-300" />
            <h3 className="text-lg font-semibold text-gray-100">Transcript</h3>
            <Badge variant="outline" className="text-white/80">
              {hasTranscript ? "Available" : "Pending"}
            </Badge>
          </div>
          {authorized && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                disabled={isLoading}
                className="gap-2 rounded-full border border-white/10 text-white/80 hover:bg-white/10"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyTranscript}
                disabled={!canCopy}
                className="gap-2 rounded-full border-white/20 bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl border p-4 text-sm text-gray-200",
            !authorized && "blur-md pointer-events-none",
            authorized
              ? "border-white/10 bg-black/30"
              : "border-white/5 bg-black/20",
          )}
        >
          {!authorized && (
            <p className="text-center text-sm text-gray-400">
              Connect to view transcript
            </p>
          )}
          {authorized && !hasTranscript && (
            <p className="text-sm text-gray-400">
              Transcript will appear once Recall finishes processing.
            </p>
          )}
          {authorized && hasTranscript && (
            <>
              {isLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((key) => (
                    <div
                      key={key}
                      className="h-3 w-full rounded bg-white/10 animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 text-sm text-red-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ) : transcriptEntries.length ? (
                <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                  {transcriptEntries.map((entry, index) => {
                    const alignment =
                      entry.speaker.toLowerCase().includes("you") ||
                      entry.speaker.toLowerCase().includes("host")
                        ? "justify-end"
                        : "justify-start"
                    return (
                      <div
                        key={`${entry.speaker}-${index}-${entry.timestamp ?? index}`}
                        className={`flex ${alignment}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-lg ${
                            alignment === "justify-end"
                              ? "border-purple-500/40 bg-purple-500/10 text-purple-100"
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
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function AiSection({
  title,
  icon,
  content,
  generated,
  isAuthorized,
}: {
  title: string
  icon: ReactNode
  content: string
  generated: boolean
  isAuthorized: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div
        className={`glass-card bg-[#252830]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 transition-all duration-500 ${!isAuthorized && "blur-md"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
            <Badge variant={generated ? "secondary" : "outline"}>
              {generated ? "Generated" : "Pending"}
            </Badge>
          </div>
          {isAuthorized && generated && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="gap-2 rounded-full border border-white/10 text-white/80 hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 rounded-full border-white/20 bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50"
              >
                <Copy className="w-4 h-4" /> Copy
              </Button>
            </div>
          )}
        </div>
        <div className="bg-[#1a1d24] rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono min-h-[160px]">
          {content}
        </div>
      </div>
    </motion.div>
  )
}

function useActivityDisplay(
  activity: MeetingActivity | undefined,
  locale: string,
) {
  return useMemo(() => {
    if (!activity) {
      return {
        title: "Meeting",
        timeLabel: "--:--",
        durationLabel: "1h",
        dateLabel: new Date().toLocaleDateString(locale, {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        ownerLabel: "calendar@jump.ai",
        emailCopy: "Content hidden",
        summaryCopy: "Content hidden",
      }
    }

    const event = activity.details.event
    const start = event.startTime ? new Date(event.startTime) : null
    const end = event.endTime ? new Date(event.endTime) : null

    const durationHours =
      start && end
        ? Math.max(1, (end.getTime() - start.getTime()) / 3600000)
        : 1

    return {
      title: event.title ?? "Meeting",
      timeLabel: start
        ? start.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
      durationLabel: `${durationHours.toFixed(1).replace(/\\.0$/, "")}h`,
      dateLabel: start
        ? start.toLocaleDateString(locale, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : new Date().toLocaleDateString(locale),
      ownerLabel:
        event.creatorEmail ?? event.calendarTitle ?? "calendar@jump.ai",
      emailCopy: activity.details.insight?.followUpEmail ?? undefined,
      summaryCopy: activity.details.insight?.summary ?? undefined,
    }
  }, [activity, locale])
}

function useAccessState({
  viewer,
  queryStatus,
  queryError,
  hasData,
}: {
  viewer: MeetingActivityClientProps["viewer"]
  queryStatus: "pending" | "error" | "success" | "idle"
  queryError: unknown
  hasData: boolean
}): AccessState {
  if (!viewer.id) {
    return "unauthenticated"
  }
  if (hasData) {
    return "authorized"
  }
  if (queryError instanceof ApiError) {
    if (queryError.status === 401) return "unauthenticated"
    if (queryError.status === 403) return "forbidden"
  }
  if (queryStatus === "pending") {
    return "loading"
  }
  return viewer.initialAccess ?? "idle"
}

function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "YO"
  )
}
