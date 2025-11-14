import type { AppUser } from "./types"

export type KeycloakProfile = {
  sub?: string
  email?: string
  email_verified?: boolean
  preferred_username?: string
  given_name?: string
  family_name?: string
  name?: string
  picture?: string
}

type NextAuthUser = {
  id?: string | null
  email?: string | null
  name?: string | null
  image?: string | null
}

type UserPatch = Partial<AppUser>

const hasValues = (patch?: UserPatch): patch is UserPatch =>
  !!patch &&
  Object.values(patch).some(
    (value) => value !== undefined && value !== null && value !== "",
  )

const fullNameFromParts = (...parts: Array<string | undefined>) => {
  const value = parts
    .map((part) => part?.trim())
    .filter((part) => part && part.length > 0)
    .join(" ")
    .trim()

  return value.length > 0 ? value : undefined
}

export const normalizeNextAuthUser = (
  user?: NextAuthUser | null,
): UserPatch | undefined => {
  if (!user) {
    return undefined
  }

  const patch: UserPatch = {}

  if (user.id) patch.id = user.id
  if (user.email) patch.email = user.email
  if (user.name) patch.name = user.name
  if (user.image) patch.image = user.image

  return hasValues(patch) ? patch : undefined
}

export const keycloakProfileToUser = (
  profile?: KeycloakProfile | null,
): UserPatch | undefined => {
  if (!profile) {
    return undefined
  }

  const patch: UserPatch = {}

  if (profile.sub) patch.id = profile.sub
  if (profile.email) patch.email = profile.email
  if (profile.picture) patch.image = profile.picture
  if (profile.preferred_username) patch.username = profile.preferred_username
  if (profile.given_name) patch.firstName = profile.given_name
  if (profile.family_name) patch.lastName = profile.family_name
  if (typeof profile.email_verified === "boolean") {
    patch.emailVerified = profile.email_verified
  }

  patch.name =
    profile.name?.trim() ||
    fullNameFromParts(profile.given_name, profile.family_name) ||
    profile.preferred_username ||
    profile.email ||
    profile.sub

  return hasValues(patch) ? patch : undefined
}

export const mergeUsers = (
  ...users: Array<UserPatch | undefined>
): AppUser | undefined => {
  const defined = users.filter(hasValues)

  if (defined.length === 0) {
    return undefined
  }

  return defined.reduce<AppUser>(
    (acc, patch) => ({
      ...acc,
      ...patch,
    }),
    {} as AppUser,
  )
}
