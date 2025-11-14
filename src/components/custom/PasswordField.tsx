"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { UseFormRegisterReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PasswordFieldProps {
  name: string
  label: string
  placeholder?: string
  error?: string
  autoComplete?: string
  inputProps: UseFormRegisterReturn
}

export function PasswordField({
  name,
  label,
  placeholder,
  error,
  inputProps,
  autoComplete,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${name}-error` : undefined}
          {...inputProps}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          className={cn(error && "border-destructive")}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </Button>
      </div>
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

