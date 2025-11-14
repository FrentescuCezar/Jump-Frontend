import { env } from "@/config/env"

/**
 * Builds a Keycloak authorization URL with optional identity provider hint.
 * When kc_idp_hint is provided, Keycloak will directly redirect to that provider.
 *
 * @param providerAlias - The alias of the identity provider configured in Keycloak (e.g., "google", "facebook", "github")
 * @param options - Optional configuration
 * @returns The full Keycloak authorization URL
 */
export function buildKeycloakLoginUrl(
  providerAlias?: string,
  options?: {
    redirectUri?: string
    state?: string
  },
): string {
  const baseUrl = env.keycloak.baseUrl?.replace(/\/$/, "") ?? ""
  const realm = env.keycloak.realm ?? ""
  const clientId = env.keycloak.clientId ?? ""

  // NextAuth callback URL - must match what's configured in NextAuth
  const redirectUri =
    options?.redirectUri ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/api/auth/callback/keycloak`
      : "")

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
  })

  // kc_idp_hint tells Keycloak to skip the provider selection page
  // and go directly to the specified identity provider
  if (providerAlias) {
    params.set("kc_idp_hint", providerAlias)
  }

  if (options?.state) {
    params.set("state", options.state)
  }

  return `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`
}

/**
 * Common identity provider aliases in Keycloak.
 * These match the alias you configure in Keycloak Admin Console.
 */
export const KEYCLOAK_PROVIDERS = {
  google: "google",
  facebook: "facebook",
  github: "github",
  microsoft: "microsoft",
  apple: "apple",
} as const

