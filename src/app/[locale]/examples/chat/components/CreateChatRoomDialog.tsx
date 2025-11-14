"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { useActionState, startTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FormField as CustomFormField } from "@/components/custom/FormField"
import { getFieldError, initState, Val } from "@/lib/forms"
import { useToast } from "@/lib/toastCall"
import { CreateChatRoomSchema } from "@/schemas/examples/create-chat-room"
import { createChatRoomAction } from "../actions/createChatRoomAction"
import { useChatStore } from "@/features/examples/chat/store"
import { fetchChatRooms } from "@/features/examples/chat/api"
import { FormErrors } from "@/components/custom/FormErrors"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Values = Val<typeof CreateChatRoomSchema>

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CreateChatRoomDialog() {
  /* ---------------------------- i18n ---------------------------- */
  const t = useTranslations("Examples.Chat.sidebar")
  const tGlobal = useTranslations()

  /* --------------------------- state ---------------------------- */
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    createChatRoomAction,
    initState(CreateChatRoomSchema),
  )
  const setRooms = useChatStore((state) => state.setRooms)
  const setActiveRoom = useChatStore((state) => state.setActiveRoom)
  const handledSuccessRef = useRef(false)

  /* --------------------------- toast ---------------------------- */
  useToast({
    actionState: state,
    showSuccess: true,
    successMessage:
      t("create.toastSuccess") || tGlobal("Common.toasts.success"),
    showError: true,
    translatorsForErrors: { tGlobal, tForm: t },
  })

  /* --------------------- react-hook-form ------------------------ */
  const {
    register,
    handleSubmit,
    formState: { errors: clientErrors },
    control,
    watch,
    reset,
  } = useForm<Values>({
    resolver: zodResolver(CreateChatRoomSchema),
    mode: "onChange",
    defaultValues: {
      name: state.values.name ?? "",
      description: state.values.description ?? "",
      theme: state.values.theme ?? "",
    },
  })

  const fieldError = getFieldError<Values>({
    watch,
    clientErrors: clientErrors,
    serverErrors: state.errors.fields,
    tForm: t,
    tGlobal,
  })

  const handleClose = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      reset({
        name: "",
        description: "",
        theme: "",
      })
    }
  }

  const onSubmit = (data: Values) => {
    startTransition(() => {
      formAction(data)
    })
  }

  // Refresh rooms when creation succeeds
  useEffect(() => {
    if (state.ok && open && !handledSuccessRef.current) {
      handledSuccessRef.current = true
      fetchChatRooms().then((rooms) => {
        setRooms(rooms)
        if (rooms.length > 0) {
          setActiveRoom(rooms[0].slug)
        }
        handleClose(false)
      })
    }
    // Reset ref when dialog closes
    if (!open) {
      handledSuccessRef.current = false
    }
  }, [state.ok, open, setRooms, setActiveRoom])

  /* ----------------------------- UI ----------------------------- */
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          {t("create.button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
          <DialogDescription>{t("create.subtitle")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <CustomFormField
            name="name"
            label={t("create.name")}
            error={fieldError("name")}
            placeholder="Release Watch"
            inputProps={register("name")}
          />

          <div className="space-y-2">
            <Label htmlFor="description">{t("create.description")}</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={3}
              placeholder="Escalations channel for launch week."
              aria-invalid={fieldError("description") ? "true" : "false"}
            />
            {fieldError("description") && (
              <p className="text-sm text-destructive">
                {fieldError("description")}
              </p>
            )}
          </div>

          <CustomFormField
            name="theme"
            label={t("create.theme")}
            error={fieldError("theme")}
            placeholder="#2563eb"
            inputProps={register("theme")}
          />

          <FormErrors errors={state.errors} />

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? t("create.submitting") : t("create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
