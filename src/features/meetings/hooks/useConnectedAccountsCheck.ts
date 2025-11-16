"use client"

import { useMemo } from "react"
import { useConnectedAccounts } from "@/features/integrations/hooks/useConnectedAccounts"
import type { SocialPost } from "@/schemas/meetings/details"

type SocialChannel = SocialPost["channel"]

type ConnectedAccountsCheck = {
  hasLinkedIn: boolean | undefined
  hasFacebook: boolean | undefined
  isLoading: boolean
  canPublish: Record<SocialChannel, boolean>
}

/**
 * Hook to check if user has connected LinkedIn/Facebook accounts.
 * Matches the exact pattern used in settings page for consistency.
 */
export function useConnectedAccountsCheck(
  enabled: boolean = true,
): ConnectedAccountsCheck {
  const { query } = useConnectedAccounts({ enabled })
  const accounts = query.data ?? []

  // Filter accounts by provider - exactly like settings page does
  const linkedInAccounts = useMemo(
    () => accounts.filter((account) => account.provider === "LINKEDIN"),
    [accounts],
  )

  const facebookAccounts = useMemo(
    () => accounts.filter((account) => account.provider === "FACEBOOK"),
    [accounts],
  )

  // Only return boolean values when query has completed successfully
  // Return undefined while loading to prevent false negatives
  const hasLinkedIn = useMemo(() => {
    if (query.isLoading || query.isPending || query.isFetching) {
      return undefined
    }
    // Match settings page: check if accounts array has length > 0
    return linkedInAccounts.length > 0
  }, [
    query.isLoading,
    query.isPending,
    query.isFetching,
    linkedInAccounts.length,
  ])

  const hasFacebook = useMemo(() => {
    if (query.isLoading || query.isPending || query.isFetching) {
      return undefined
    }
    // Match settings page: check if accounts array has length > 0
    return facebookAccounts.length > 0
  }, [
    query.isLoading,
    query.isPending,
    query.isFetching,
    facebookAccounts.length,
  ])

  // canPublish should check account length directly (like settings page)
  // This ensures we use the actual data even during loading/refetching states
  // Only return false when we're certain there are no accounts
  const canPublish = useMemo(
    () => ({
      LINKEDIN: linkedInAccounts.length > 0,
      FACEBOOK: facebookAccounts.length > 0,
    }),
    [linkedInAccounts.length, facebookAccounts.length],
  )

  return {
    hasLinkedIn,
    hasFacebook,
    isLoading: query.isLoading || query.isPending || query.isFetching,
    canPublish,
  }
}
