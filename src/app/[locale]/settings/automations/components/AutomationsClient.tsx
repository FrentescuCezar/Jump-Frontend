"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  Check,
  Edit,
  Facebook,
  Linkedin,
  Plus,
  Sparkles,
} from "lucide-react"
import { useAutomations } from "@/features/automations/hooks/useAutomations"
import { automationsKey } from "@/features/automations/queries"
import { saveAutomationAction } from "@/app/[locale]/settings/automations/actions"
import type { Automation } from "@/schemas/automations/automation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  channel: z.enum(["LINKEDIN", "FACEBOOK"]),
  promptTemplate: z.string().min(10, "Prompt should be at least 10 characters"),
  isEnabled: z.boolean(),
})

type AutomationFormValues = z.infer<typeof formSchema>
type AutomationsClientProps = {
  locale: string
}
type Channel = Automation["channel"]

const channelMeta: Record<
  Channel,
  { label: string; icon: LucideIcon; accent: string }
> = {
  LINKEDIN: {
    label: "LinkedIn",
    icon: Linkedin,
    accent: "#0A66C2",
  },
  FACEBOOK: {
    label: "Facebook",
    icon: Facebook,
    accent: "#1877F2",
  },
}

export function AutomationsClient({ locale }: AutomationsClientProps) {
  const queryClient = useQueryClient()
  const { query, automations } = useAutomations({ locale })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Automation | null>(null)
  const [isSaving, startSaving] = useTransition()

  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      channel: "LINKEDIN",
      promptTemplate: "",
      isEnabled: true,
    },
  })

  const refreshing = query.isFetching && query.isFetched

  const activeLinkedin = useMemo(
    () =>
      automations.find(
        (automation) =>
          automation.channel === "LINKEDIN" && automation.isEnabled,
      ),
    [automations],
  )

  const activeFacebook = useMemo(
    () =>
      automations.find(
        (automation) =>
          automation.channel === "FACEBOOK" && automation.isEnabled,
      ),
    [automations],
  )

  const openCreateForm = () => {
    setEditing(null)
    form.reset({
      name: "",
      channel: "LINKEDIN",
      promptTemplate: "",
      isEnabled: true,
    })
    setIsFormOpen(true)
  }

  const openEditForm = (automation: Automation) => {
    setEditing(automation)
    form.reset({
      id: automation.id,
      name: automation.name,
      channel: automation.channel,
      promptTemplate: automation.promptTemplate,
      isEnabled: automation.isEnabled,
    })
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditing(null)
    form.reset({
      name: "",
      channel: "LINKEDIN",
      promptTemplate: "",
      isEnabled: true,
    })
  }

  const handleSubmit = (values: AutomationFormValues) => {
    startSaving(async () => {
      try {
        await saveAutomationAction({
          id: values.id,
          name: values.name,
          channel: values.channel,
          promptTemplate: values.promptTemplate,
          isEnabled: values.isEnabled,
          locale,
        })
        toast.success(values.id ? "Automation updated" : "Automation created")
        closeForm()
        await queryClient.invalidateQueries({
          queryKey: automationsKey({ locale }),
        })
      } catch (error) {
        console.error(error)
        toast.error("Failed to save automation")
      }
    })
  }

  const handleToggle = (automation: Automation, next: boolean) => {
    startSaving(async () => {
      try {
        await saveAutomationAction({
          id: automation.id,
          name: automation.name,
          channel: automation.channel,
          promptTemplate: automation.promptTemplate,
          isEnabled: next,
          locale,
        })
        await queryClient.invalidateQueries({
          queryKey: automationsKey({ locale }),
        })
      } catch (error) {
        console.error(error)
        toast.error("Failed to update automation")
      }
    })
  }

  const handleSetActive = (automation: Automation) => {
    if (automation.isEnabled) {
      return
    }

    handleToggle(automation, true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0a0118] via-[#1a0a2e] to-[#0f0520] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute h-[600px] w-[600px] rounded-full bg-linear-to-r from-purple-500 to-blue-500 opacity-10 blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute h-[400px] w-[400px] rounded-full bg-linear-to-r from-cyan-500 to-teal-500 opacity-15 blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 80, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "20%", right: "10%" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link href={`/${locale}/settings/integrations`}>
            <Button
              variant="ghost"
              className="mb-6 border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text">
                Automation Templates
              </h1>
              <p className="mt-3 text-lg text-gray-300">
                Create custom AI prompts for generating social media posts from
                your meetings.
              </p>
            </div>
            <Button
              onClick={openCreateForm}
              className="bg-linear-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Template
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <ChannelSummary
            title="Active LinkedIn Template"
            channel="LINKEDIN"
            activeAutomation={activeLinkedin}
          />
          <ChannelSummary
            title="Active Facebook Template"
            channel="FACEBOOK"
            activeAutomation={activeFacebook}
          />
        </motion.div>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              key={editing ? `edit-${editing.id}` : "create"}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 48 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-2xl border border-purple-500/30 bg-purple-500/5 p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-cyan-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {editing ? "Edit automation" : "Create new template"}
                  </h3>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-300">
                              Template name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isSaving}
                                placeholder="e.g., Technical Deep Dive"
                                className="border-white/10 bg-white/5 text-white placeholder:text-white/60"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="channel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-gray-300">
                              Channel
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isSaving}
                            >
                              <FormControl>
                                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                                  <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#13061f] text-white">
                                {(["LINKEDIN", "FACEBOOK"] as Channel[]).map(
                                  (channel) => {
                                    const meta = channelMeta[channel]
                                    const Icon = meta.icon
                                    return (
                                      <SelectItem key={channel} value={channel}>
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="flex h-6 w-6 items-center justify-center rounded-lg"
                                            style={{
                                              backgroundColor: meta.accent,
                                            }}
                                          >
                                            <Icon className="h-3.5 w-3.5 text-white" />
                                          </div>
                                          {meta.label}
                                        </div>
                                      </SelectItem>
                                    )
                                  },
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="promptTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-300">
                            Prompt template
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={6}
                              disabled={isSaving}
                              placeholder="Describe how AI should translate your meetings into a post for this channel..."
                              className="border-white/10 bg-white/5 text-white placeholder:text-white/60"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <FormLabel className="text-base text-white">
                              Enable by default
                            </FormLabel>
                            <p className="text-sm text-white/70">
                              Only one template per channel can be active at a
                              time.
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSaving}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-wrap justify-end gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={closeForm}
                        className="text-white hover:bg-white/10"
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="bg-linear-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                      >
                        {isSaving ? "Saving..." : "Save template"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {query.error && (
          <div className="glass-card rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
            Failed to load automations. Please try again.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="mb-6 text-2xl font-bold">All Templates</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {automations.map((automation, idx) => (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={cn(
                  "glass-card border backdrop-blur-xl rounded-2xl p-6",
                  automation.isEnabled
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-white/10 bg-white/5",
                )}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: channelMeta[automation.channel].accent,
                      }}
                    >
                      {(() => {
                        const Icon = channelMeta[automation.channel].icon
                        return <Icon className="h-5 w-5 text-white" />
                      })()}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {automation.name}
                      </div>
                      <div className="text-sm text-gray-300">
                        {channelMeta[automation.channel].label}
                      </div>
                    </div>
                  </div>
                  {automation.isEnabled && (
                    <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-300">
                      <Check className="h-3.5 w-3.5" />
                      Active
                    </div>
                  )}
                </div>

                <p className="mb-4 text-sm text-gray-200 line-clamp-3">
                  {automation.promptTemplate}
                </p>

                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                  <div className="flex items-center gap-3 text-gray-200">
                    <Switch
                      checked={automation.isEnabled}
                      onCheckedChange={(checked) =>
                        handleToggle(automation, checked)
                      }
                      disabled={isSaving}
                    />
                    <span>{automation.isEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                  <div className="flex gap-2">
                    {!automation.isEnabled && (
                      <Button
                        size="sm"
                        onClick={() => handleSetActive(automation)}
                        disabled={isSaving}
                        className="bg-green-500/20 text-green-200 hover:bg-green-500/30"
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditForm(automation)}
                      className="text-white hover:bg-white/10"
                      disabled={isSaving}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {automations.length === 0 && !query.isLoading && (
            <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-white/70">
              No automations yet. Create your first one to start generating
              drafts.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function ChannelSummary({
  title,
  channel,
  activeAutomation,
}: {
  title: string
  channel: Channel
  activeAutomation?: Automation
}) {
  const meta = channelMeta[channel]
  const Icon = meta.icon

  return (
    <div
      className={cn(
        "glass-card rounded-2xl border backdrop-blur-xl p-6",
        channel === "LINKEDIN"
          ? "border-[#0A66C2]/30 bg-[#0A66C2]/5"
          : "border-[#1877F2]/30 bg-[#1877F2]/5",
      )}
    >
      <div className="mb-4 flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: meta.accent }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-white/60">
            {title}
          </div>
          <div className="text-xl font-semibold">
            {activeAutomation?.name ?? "None"}
          </div>
        </div>
      </div>
      {activeAutomation ? (
        <div className="flex items-center gap-2 text-sm text-green-200">
          <Check className="h-4 w-4" />
          Currently active
        </div>
      ) : (
        <p className="text-sm text-white/70">
          Choose a template to power this channel&apos;s automation.
        </p>
      )}
    </div>
  )
}
