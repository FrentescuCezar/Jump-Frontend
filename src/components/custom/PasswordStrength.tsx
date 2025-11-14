"use client"

import { CheckIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

interface PasswordStrengthProps {
  password: string
  requirements: PasswordRequirement[]
  className?: string
}

/**
 * PasswordStrength
 * ================
 * Shows real-time password requirements with checkmarks.
 * Each requirement turns green when satisfied.
 */
export function PasswordStrength({
  password,
  requirements,
  className,
}: PasswordStrengthProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {requirements.map((req, idx) => {
        const isValid = req.test(password)
        return (
          <div
            key={idx}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              isValid ? "text-success" : "text-muted-foreground",
            )}
          >
            {isValid ? (
              <CheckIcon className="size-4 shrink-0" />
            ) : (
              <XIcon className="size-4 shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        )
      })}
    </div>
  )
}

