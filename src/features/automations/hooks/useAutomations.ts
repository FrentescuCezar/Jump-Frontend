"use client"

import { useQuery } from "@tanstack/react-query"
import { automationsQuery } from "../queries"
import type { AutomationsQueryInput } from "../types"

export function useAutomations(input: AutomationsQueryInput) {
  const query = useQuery({
    ...automationsQuery(input),
  })

  return {
    query,
    automations: query.data ?? [],
  }
}

