"use server"

import { disconnectConnectedAccount } from "@/features/onboarding/api"

type DisconnectConnectedAccountActionInput = {
  accountId: string
  locale: string
}

export async function disconnectConnectedAccountAction(
  input: DisconnectConnectedAccountActionInput,
) {
  await disconnectConnectedAccount(input.accountId)
  return { success: true }
}

