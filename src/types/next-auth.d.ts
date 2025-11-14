import type { AppUser } from "@/lib/auth/types"

declare module "next-auth" {
  interface Session {
    user?: AppUser
    tokens: {
      accessToken: string
      refreshToken?: string
      idToken?: string
      expiresAt: number
    }
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    idToken?: string
    expiresAt?: number
    error?: string
    user?: AppUser
  }
}
