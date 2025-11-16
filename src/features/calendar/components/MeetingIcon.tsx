import Image from "next/image"
import { ICON_SIZES } from "../constants/icons"

type MeetingIconProps = {
  type: string
  size?: number
}

export function MeetingIcon({ type, size = ICON_SIZES.meeting.medium }: MeetingIconProps) {
  if (type === "ZOOM" || type === "zoom") {
    return (
      <Image
        src="/icons/Zoom.svg"
        alt="Zoom"
        width={size}
        height={size}
        className="flex-shrink-0"
      />
    )
  }
  
  if (type === "MICROSOFT_TEAMS" || type === "teams") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#5059C9" />
        <text x="12" y="16" fontSize={size * 0.67} fill="white" textAnchor="middle" fontWeight="bold">T</text>
      </svg>
    )
  }
  
  if (type === "GOOGLE_MEET" || type === "meet") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="#00832D"/>
      </svg>
    )
  }
  
  return null
}

