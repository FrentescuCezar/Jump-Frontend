import type { Automation } from "@/schemas/automations/automation"

export type AutomationsQueryInput = {
  locale: string
}

export type AutomationsQueryResult = Automation[]

