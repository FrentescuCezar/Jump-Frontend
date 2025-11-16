import { BOT_STATUS_COLORS } from "../constants/monthView"
import type { BotIconProps } from "../types"

const SIZE_MAP = {
  small: 14,
  medium: 18,
  large: 24,
}

export function BotIcon({ status, size = "small" }: BotIconProps) {
  if (!status) return null

  const getColor = () => {
    switch (status) {
      case "DONE":
      case "COMPLETED":
        return BOT_STATUS_COLORS.COMPLETED
      case "CANCELLED":
      case "CANCELED":
        return BOT_STATUS_COLORS.CANCELED
      case "SCHEDULED":
      case "JOINING":
      case "IN_CALL":
      case "UPCOMING":
        return BOT_STATUS_COLORS.UPCOMING
      default:
        return BOT_STATUS_COLORS.default
    }
  }

  const color = getColor()
  const iconSize = SIZE_MAP[size]
  const strokeWidth = size === "large" ? 2.5 : size === "medium" ? 2 : 2

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect
        x="6"
        y="8"
        width="12"
        height="10"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={`${color}20`}
      />
      <circle cx="9" cy="12" r="1" fill={color} />
      <circle cx="15" cy="12" r="1" fill={color} />
      <path
        d="M9 15h6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}

