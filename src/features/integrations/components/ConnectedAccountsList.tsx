"use client"

import { useTransition, useState, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ConnectedAccount } from "../types"
import { disconnectAccountAction } from "../actions/disconnectAccountAction"

type ConnectedAccountsListProps = {
  accounts: ConnectedAccount[]
  locale: string
  emptyTitle?: string
  emptyDescription?: string
}

export function ConnectedAccountsList({
  accounts,
  locale,
  emptyTitle = "No accounts connected",
  emptyDescription = "Connect an account to get started.",
}: ConnectedAccountsListProps) {
  const [isPending, startTransition] = useTransition()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleDisconnect = (id: string) => {
    startTransition(async () => {
      await disconnectAccountAction({ accountId: id, locale })
    })
  }

  if (!accounts.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">{emptyTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {emptyDescription}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {accounts.map((account) => {
        const metadata = account.metadata as AccountMetadata | null
        const metadataLines = buildMetadataLines(metadata)
        return (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle>{account.label ?? account.provider}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{account.provider}</Badge>
                {account.lastSyncedAt && (
                  <Badge variant="outline">
                    Synced {isMounted ? format(new Date(account.lastSyncedAt), "PPpp") : ""}
                  </Badge>
                )}
                {account.expiresAt && (
                  <Badge variant="outline">
                    Expires {isMounted ? format(new Date(account.expiresAt), "PP") : ""}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>Scopes: {account.scopes.join(", ") || "n/a"}</p>
              {metadataLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p>Linked {isMounted ? format(new Date(account.linkedAt), "PPpp") : ""}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="text-destructive"
                disabled={isPending}
                onClick={() => handleDisconnect(account.id)}
              >
                Disconnect
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

type AccountMetadata = {
  email?: string
  name?: string
  picture?: string
  urn?: string
  localizedFirstName?: string
  localizedLastName?: string
  pageId?: string
  pageName?: string
  category?: string
} | null

function buildMetadataLines(metadata: AccountMetadata) {
  if (!metadata) return []
  const lines: string[] = []
  if (metadata.name) {
    lines.push(`Name: ${metadata.name}`)
  } else if (metadata.localizedFirstName || metadata.localizedLastName) {
    lines.push(
      `Name: ${[metadata.localizedFirstName, metadata.localizedLastName]
        .filter(Boolean)
        .join(" ")}`,
    )
  }
  if (metadata.email) {
    lines.push(`Email: ${metadata.email}`)
  }
  if (metadata.pageName) {
    lines.push(`Page: ${metadata.pageName}`)
  }
  if (metadata.category) {
    lines.push(`Category: ${metadata.category}`)
  }
  if (metadata.urn) {
    lines.push(`URN: ${metadata.urn}`)
  }
  return lines
}

