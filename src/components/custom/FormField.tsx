import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export type FormFieldProps = {
  name: string
  label: React.ReactNode
  icon?: React.ReactNode
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"]
  placeholder?: string
  autoComplete?: string
  defaultValue?: string
  error?: string
  errorIcon?: React.ReactNode
  disabled?: boolean
  /** Helper text shown when there's NO validation error */
  inputDetails?: string
  /** Props forwarded to the underlying <input> (works with RHF `register`) */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export function FormField({
  name,
  label,
  icon,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue = "",
  error,
  errorIcon,
  disabled = false,
  inputDetails,
  inputProps,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        defaultValue={defaultValue}
        {...inputProps}
      />
      {error ? (
        <p className="text-sm text-destructive flex items-center gap-1">
          {errorIcon}
          {error}
        </p>
      ) : (
        inputDetails && (
          <p className="text-xs text-muted-foreground">{inputDetails}</p>
        )
      )}
    </div>
  )
}
