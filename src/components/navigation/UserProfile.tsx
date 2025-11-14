import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AppUser } from "@/lib/auth/types"
import {
  buildDisplayName,
  getInitials,
  getUserSecondaryInfo,
} from "./utils/user-display"

type UserProfileProps = {
  user: AppUser
}

export function UserProfile({ user }: UserProfileProps) {
  const fullName = buildDisplayName(user)
  const secondary = getUserSecondaryInfo(user)
  const initialsSource = fullName ?? secondary ?? user.username ?? "?"

  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <p className="text-sm font-medium">{fullName}</p>
        {secondary ? (
          <p className="text-xs text-muted-foreground">{secondary}</p>
        ) : null}
      </div>
      <Avatar className="h-9 w-9">
        <AvatarImage
          src={user.image ?? undefined}
          alt={fullName ?? secondary ?? "User avatar"}
        />
        <AvatarFallback>{getInitials(initialsSource)}</AvatarFallback>
      </Avatar>
    </div>
  )
}
