"use server"

import { fetchAutomations } from "@/features/automations/api"

export async function getAutomationsAction() {
  return fetchAutomations()
}

