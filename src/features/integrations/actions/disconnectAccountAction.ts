"use server"

import { revalidatePath } from "next/cache"
import { authFetch } from "@/lib/authFetch"
import { env } from "@/config/env"

export async function disconnectAccountAction(input: {
  accountId: string
  locale: string
}) {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }

  await authFetch(`${env.backendUrl}/integrations/connected-accounts/${input.accountId}`, {
    method: "DELETE",
  })

  revalidatePath(`/${input.locale}/settings/integrations`)
}


