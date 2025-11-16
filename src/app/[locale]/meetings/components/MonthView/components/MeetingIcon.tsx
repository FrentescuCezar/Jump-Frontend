import Image from "next/image"
import type { MeetingIconProps } from "../types"

const SIZE_MAP = {
  small: 14,
  medium: 18,
  large: 24,
}

export function MeetingIcon({ type, size = "small" }: MeetingIconProps) {
  const iconSize = SIZE_MAP[size]

  if (type === "ZOOM" || type === "zoom") {
    return (
      <Image
        src="/icons/Zoom.svg"
        alt="Zoom"
        width={iconSize}
        height={iconSize}
        className="shrink-0"
      />
    )
  }

  if (type === "MICROSOFT_TEAMS" || type === "teams") {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#5059C9" />
        <text
          x="12"
          y="16"
          fontSize={iconSize * 0.75}
          fill="white"
          textAnchor="middle"
          fontWeight="bold"
        >
          T
        </text>
      </svg>
    )
  }

  if (type === "GOOGLE_MEET" || type === "meet") {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
          fill="#00832D"
        />
      </svg>
    )
  }

  return null
}

