import { getServerSession } from "next-auth"
import type { NextAuthOptions } from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import type { JWT } from "next-auth/jwt"
import { env } from "@/config/env"
import {
  keycloakProfileToUser,
  mergeUsers,
  normalizeNextAuthUser,
  type KeycloakProfile,
} from "@/lib/auth/user"

if (!env.keycloak.baseUrl) {
  throw new Error(
    "KEYCLOAK_BASE_URL or NEXT_PUBLIC_KEYCLOAK_URL must be set in environment variables",
  )
}

if (!env.keycloak.realm) {
  throw new Error(
    "KEYCLOAK_REALM or NEXT_PUBLIC_KEYCLOAK_REALM must be set in environment variables",
  )
}

if (!env.keycloak.clientId) {
  throw new Error(
    "KEYCLOAK_CLIENT_ID or NEXT_PUBLIC_KEYCLOAK_CLIENT_ID must be set in environment variables",
  )
}

const keycloakIssuer = `${env.keycloak.baseUrl.replace(/\/$/, "")}/realms/${env.keycloak.realm}`
const keycloakSecret = env.keycloak.secret
const keycloakClientId = env.keycloak.clientId

// For public clients, secret is optional (PKCE handles security)
// But token refresh requires a secret, so we'll handle that gracefully

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" }
  }

  try {
    const params = new URLSearchParams({
      client_id: keycloakClientId!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    })

    if (keycloakSecret) {
      params.append("client_secret", keycloakSecret)
    }

    const response = await fetch(
      `${keycloakIssuer}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
        cache: "no-store",
      },
    )

    const refreshed = await response.json()

    if (!response.ok) {
      throw refreshed
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      idToken: refreshed.id_token ?? token.idToken,

      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
      error: undefined,
    }
  } catch (error: any) {
    console.error("Failed to refresh Keycloak token", error)

    // If refresh token is invalid, clear it to force re-authentication
    if (error?.error === "invalid_grant") {
      return {
        ...token,
        accessToken: undefined,
        refreshToken: undefined,
        error: "RefreshAccessTokenError",
      }
    }

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authConfig: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: keycloakClientId!,
      clientSecret: keycloakSecret || "",
      issuer: keycloakIssuer,
      wellKnown: `${keycloakIssuer}/.well-known/openid-configuration`,
      // Enable PKCE for public clients
      checks: ["pkce", "state"],
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        const expiresIn =
          typeof account.expires_in === "number" ? account.expires_in : 300
        const expiresAt =
          typeof account.expires_at === "number"
            ? account.expires_at * 1000
            : Date.now() + expiresIn * 1000

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          expiresAt,
          error: undefined,
          user: mergeUsers(
            token.user,
            normalizeNextAuthUser(user),
            keycloakProfileToUser(profile as KeycloakProfile | null),
          ),
        }
      }

      // Refresh token if expired (with 60s buffer)
      if (
        token.expiresAt &&
        Date.now() >= token.expiresAt - 60 * 1000 &&
        token.refreshToken
      ) {
        return refreshAccessToken(token)
      }

      return token
    },
    async session({ session, token }) {
      const mergedUser = mergeUsers(session.user, token.user)
      if (mergedUser) {
        session.user = mergedUser
      }
      session.tokens = {
        accessToken: token.accessToken ?? "",
        refreshToken: token.refreshToken,
        idToken: token.idToken,
        expiresAt: token.expiresAt ?? 0,
      }
      session.error = token.error
      return session
    },
  },
}

export async function getSession() {
  return getServerSession(authConfig)
}

export async function getAccessToken(): Promise<string | undefined> {
  const session = await getSession()
  return session?.tokens.accessToken
}
