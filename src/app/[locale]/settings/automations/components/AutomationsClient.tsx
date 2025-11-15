"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"
import { useAutomations } from "@/features/automations/hooks/useAutomations"
import { automationsKey } from "@/features/automations/queries"
import { saveAutomationAction } from "@/app/[locale]/settings/automations/actions"
import type { Automation } from "@/schemas/automations/automation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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

export function AutomationsClient({ locale }: AutomationsClientProps) {
  const queryClient = useQueryClient()
  const { query, automations } = useAutomations({ locale })
  const [dialogOpen, setDialogOpen] = useState(false)
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

  const openCreateDialog = () => {
    setEditing(null)
    form.reset({
      name: "",
      channel: "LINKEDIN",
      promptTemplate: "",
      isEnabled: true,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (automation: Automation) => {
    setEditing(automation)
    form.reset({
      id: automation.id,
      name: automation.name,
      channel: automation.channel,
      promptTemplate: automation.promptTemplate,
      isEnabled: automation.isEnabled,
    })
    setDialogOpen(true)
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
        toast.success(
          values.id ? "Automation updated" : "Automation created",
        )
        setDialogOpen(false)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Configure AI prompts per channel.
          </p>
          {query.isFetching && (
            <p className="text-xs text-muted-foreground">Refreshing…</p>
          )}
        </div>
        <Button onClick={openCreateDialog}>New automation</Button>
      </div>

      {query.error && (
        <Card>
          <CardContent className="p-6 text-destructive">
            Failed to load automations.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {automations.map((automation) => (
          <Card key={automation.id}>
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>{automation.name}</CardTitle>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge>{automation.channel}</Badge>
                  <Badge variant={automation.isEnabled ? "outline" : "secondary"}>
                    {automation.isEnabled ? "enabled" : "disabled"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={automation.isEnabled}
                    onCheckedChange={(checked) =>
                      handleToggle(automation, checked)
                    }
                    disabled={isSaving}
                  />
                  <span className="text-sm text-muted-foreground">Enabled</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(automation)}
                >
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {automation.promptTemplate}
              </p>
            </CardContent>
          </Card>
        ))}
        {automations.length === 0 && !query.isLoading && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No automations yet. Create your first one to start generating
              drafts.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit automation" : "Create automation"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input disabled={isSaving} {...field} />
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
                    <FormLabel>Channel</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        {...field}
                        disabled={isSaving}
                      >
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="FACEBOOK">Facebook</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promptTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt template</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        {...field}
                        disabled={isSaving}
                        placeholder="Describe how the AI should summarize the meeting for this channel."
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
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <FormLabel>Automation enabled</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Toggle to temporarily pause this automation.
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
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save automation"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

