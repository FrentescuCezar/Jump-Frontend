import type { AutomationsQueryInput } from "../types"

export const automationsKey = (input: AutomationsQueryInput) => [
  "automations",
  input.locale,
]

