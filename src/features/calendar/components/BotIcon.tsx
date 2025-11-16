import { BOT_STATUS_COLORS, BOT_STATUS_OPACITY } from "../constants/botStatus"
import { ICON_SIZES } from "../constants/icons"

type BotIconProps = {
  status: string | null | undefined
  size?: number
}

export function BotIcon({ status, size = ICON_SIZES.bot.medium }: BotIconProps) {
  if (!status) return null
  
  const getColor = () => {
    const upperStatus = status.toUpperCase()
    return (
      BOT_STATUS_COLORS[upperStatus as keyof typeof BOT_STATUS_COLORS] ||
      BOT_STATUS_COLORS.default
    )
  }
  
  const color = getColor()
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="12" height="10" rx="2" stroke={color} strokeWidth="2" fill={`${color}${BOT_STATUS_OPACITY}`}/>
      <circle cx="9" cy="12" r="1" fill={color}/>
      <circle cx="15" cy="12" r="1" fill={color}/>
      <path d="M9 15h6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M9 6V8M15 6V8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="5" r="1.5" fill={color}/>
      <circle cx="15" cy="5" r="1.5" fill={color}/>
    </svg>
  )
}

