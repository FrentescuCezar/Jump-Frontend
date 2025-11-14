"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ConnectGoogleButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/integrations/google/oauth/url", {
        credentials: "include",
      })
      const { url } = (await response.json()) as { url?: string }
      if (url) {
        window.location.href = url
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Opening Google..." : "Connect Google Calendar"}
    </Button>
  )
}


