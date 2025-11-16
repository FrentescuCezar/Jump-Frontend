"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"
import { Copy, Check, Mail, Share2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useMeetingShares } from "../hooks/useMeetingShares"

const ShareMeetingSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
})

type ShareMeetingValues = z.infer<typeof ShareMeetingSchema>

type ShareMeetingDialogProps = {
  meetingId: string
  locale: string
  meetingTitle?: string | null
  canManage: boolean
  trigger?: React.ReactNode
}

const fallbackOrigin =
  process.env.NEXT_PUBLIC_APP_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL

export function ShareMeetingDialog({
  meetingId,
  locale,
  meetingTitle,
  canManage,
  trigger,
}: ShareMeetingDialogProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${locale}/meetings/${meetingId}`
    }
    return `${fallbackOrigin ?? ""}/${locale}/meetings/${meetingId}`
  }, [locale, meetingId])

  const {
    query: shareQuery,
    shares,
    addShare,
    adding,
  } = useMeetingShares({
    meetingId,
    locale,
    enabled: canManage && open,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShareMeetingValues>({
    resolver: zodResolver(ShareMeetingSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (values: ShareMeetingValues) => {
    if (!canManage) return
    try {
      await addShare(values.email)
      reset()
      toast.success("Access granted")
    } catch (error) {
      console.error(error)
      toast.error("Unable to share this meeting")
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Link copied")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            size="sm"
            className="bg-linear-to-r from-purple-500 to-cyan-500 text-white shadow-none"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-3xl border border-white/15 bg-[#0b0918]/95 p-8 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-linear-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
            Share access
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {meetingTitle
              ? `Invite people to view “${meetingTitle}”.`
              : "Invite people to view this meeting."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <Label htmlFor="share-link" className="text-sm text-gray-300">
              Shareable link
            </Label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopy}
                className="sm:w-32 border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {canManage ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <div>
                <Label
                  htmlFor="share-email"
                  className="text-sm uppercase tracking-wide text-gray-300"
                >
                  Add people by email
                </Label>
                <p className="text-xs text-gray-400">
                  Grant view access to this meeting.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="share-email"
                  type="email"
                  placeholder="teammate@company.com"
                  {...register("email")}
                  className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || adding}
                  className="sm:w-32 bg-linear-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-none"
                >
                  {isSubmitting || adding ? "Adding..." : "Add"}
                </Button>
              </div>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </form>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-5 text-sm text-gray-300">
              Only meeting owners can invite additional viewers.
            </div>
          )}

          {canManage && (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500/20 to-cyan-500/20">
                  <Mail className="h-5 w-5 text-purple-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Approved viewers
                  </p>
                  <p className="text-xs text-gray-400">
                    Track everyone who has access in real time.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0f0c1f]/60">
                <ScrollArea className="h-48 rounded-2xl">
                  <div className="divide-y divide-white/5">
                    {shareQuery.isLoading && (
                      <div className="space-y-2 p-4">
                        {[...Array(3)].map((_, idx) => (
                          <Skeleton
                            key={idx}
                            className="h-4 w-40 bg-white/10"
                          />
                        ))}
                      </div>
                    )}
                    {!shareQuery.isLoading && shares?.length === 0 && (
                      <p className="p-4 text-sm text-gray-400">
                        No additional viewers yet.
                      </p>
                    )}
                    {shares?.map((share) => (
                      <div
                        key={share.id}
                        className="flex items-center justify-between p-4 text-sm text-white"
                      >
                        <span className="font-medium">{share.email}</span>
                        <span className="text-gray-400">
                          {new Date(share.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
