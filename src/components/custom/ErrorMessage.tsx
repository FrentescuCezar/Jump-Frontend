"use client"

interface ErrorMessageProps {
  message: string
}

/**
 * ErrorMessage
 * ============
 * Simple component to display error messages consistently.
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-destructive/10 p-3">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  )
}

