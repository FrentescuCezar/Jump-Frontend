/**
 * Event Color Constants
 * Color classes based on email or calendar title keywords
 */

export const EVENT_COLORS = {
  personal: "bg-purple-600/10 border-purple-500 text-purple-100 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.4)]",
  work: "bg-blue-500/10 border-blue-400 text-blue-100 backdrop-blur-sm shadow-[0_0_20px_rgba(96,165,250,0.4)]",
  dev: "bg-blue-500/10 border-blue-400 text-blue-100 backdrop-blur-sm shadow-[0_0_20px_rgba(96,165,250,0.4)]",
  design: "bg-pink-600/10 border-pink-500 text-pink-100 backdrop-blur-sm shadow-[0_0_20px_rgba(236,72,153,0.4)]",
  sales: "bg-yellow-400/10 border-yellow-400 text-yellow-100 backdrop-blur-sm shadow-[0_0_20px_rgba(250,204,21,0.3)]",
  marketing: "bg-orange-600/10 border-orange-500 text-orange-100 backdrop-blur-sm shadow-[0_0_20px_rgba(251,146,60,0.4)]",
  devops: "bg-cyan-600/10 border-cyan-500 text-cyan-100 backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.4)]",
  default: "bg-purple-600/10 border-purple-500 text-purple-100 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.4)]",
} as const

// Color palette used for deterministic assignment (hash maps into this list)
export const EMAIL_COLORS = [
  "bg-purple-600/10 border-purple-500 text-purple-100 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.4)]", // 1st: purple
  "bg-blue-500/10 border-blue-400 text-blue-100 backdrop-blur-sm shadow-[0_0_20px_rgba(96,165,250,0.4)]", // 2nd: blue
  "bg-yellow-400/10 border-yellow-400 text-yellow-100 backdrop-blur-sm shadow-[0_0_20px_rgba(250,204,21,0.3)]", // 3rd: yellow
  "bg-pink-600/10 border-pink-500 text-pink-100 backdrop-blur-sm shadow-[0_0_20px_rgba(236,72,153,0.4)]", // 4th: pink
  "bg-cyan-600/10 border-cyan-500 text-cyan-100 backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.4)]", // 5th: cyan
  "bg-emerald-600/10 border-emerald-500 text-emerald-100 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.4)]", // 6th: emerald
  "bg-orange-600/10 border-orange-500 text-orange-100 backdrop-blur-sm shadow-[0_0_20px_rgba(251,146,60,0.4)]", // 7th: orange
  "bg-indigo-600/10 border-indigo-500 text-indigo-100 backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.4)]", // 8th: indigo
] as const

/**
 * Deterministically maps an identifier to a color index.
 * Uses a stable hash so the same email/calendar always gets the same color,
 * regardless of fetch order or refreshes.
 */
export function getEmailColorIndex(identifier: string): number {
  if (!identifier) return 0

  const lower = identifier.toLowerCase()
  let hash = 0

  for (let i = 0; i < lower.length; i++) {
    hash = (hash * 31 + lower.charCodeAt(i)) >>> 0
  }

  return hash % EMAIL_COLORS.length
}

