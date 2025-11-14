import type { DefaultSession } from "next-auth"

export type AppUser = DefaultSession["user"] & {
  id?: string
  username?: string
  firstName?: string
  lastName?: string
  emailVerified?: boolean
}
