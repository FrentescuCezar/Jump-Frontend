"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "react-toastify"
import { updateMeetingPreferenceAction } from "@/app/[locale]/settings/integrations/actions"
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

const schema = z.object({
  leadMinutes: z.coerce.number().int().min(1).max(60),
})

type MeetingPreferencesFormProps = {
  locale: string
  initialLeadMinutes: number
}

export function MeetingPreferencesForm({
  locale,
  initialLeadMinutes,
}: MeetingPreferencesFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      leadMinutes: initialLeadMinutes,
    },
  })

  const onSubmit = (values: z.infer<typeof schema>) => {
    startTransition(async () => {
      try {
        await updateMeetingPreferenceAction({
          leadMinutes: values.leadMinutes,
          locale,
        })
        toast.success("Lead time updated")
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("Failed to update lead time")
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <FormField
          control={form.control}
          name="leadMinutes"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Minutes before meeting</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  )
}

