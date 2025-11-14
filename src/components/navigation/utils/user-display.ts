import type { AppUser } from "@/lib/auth/types"

export function getInitials(name?: string | null): string {
  if (!name) {
    return "?"
  }

  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return name.slice(0, 2).toUpperCase()
  }

  const initials = parts.slice(0, 2).map((part) => part[0])
  return initials.join("").toUpperCase()
}

export function buildDisplayName(user?: AppUser | null): string | undefined {
  if (!user) {
    return undefined
  }

  if (user.name && user.name.trim().length > 0) {
    return user.name
  }

  const combined = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()

  if (combined.length > 0) {
    return combined
  }

  return user.username ?? user.email ?? undefined
}

export function getUserSecondaryInfo(user?: AppUser | null): string {
  return user?.email ?? user?.username ?? ""
}

