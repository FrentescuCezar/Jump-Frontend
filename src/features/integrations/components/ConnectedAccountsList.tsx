"use client"

import { useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ConnectedAccount } from "../types"
import { disconnectAccountAction } from "../actions/disconnectAccountAction"

type ConnectedAccountsListProps = {
  accounts: ConnectedAccount[]
  locale: string
}

export function ConnectedAccountsList({ accounts, locale }: ConnectedAccountsListProps) {
  const [isPending, startTransition] = useTransition()

  const handleDisconnect = (id: string) => {
    startTransition(async () => {
      await disconnectAccountAction({ accountId: id, locale })
    })
  }

  if (!accounts.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">No accounts connected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect Google Calendar to sync meetings and automate Recall bots.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {accounts.map((account) => {
        const metadata = account.metadata as AccountMetadata | null
        return (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle>{account.label ?? account.provider}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{account.provider}</Badge>
                {account.lastSyncedAt && (
                  <Badge variant="outline">
                    Synced {new Date(account.lastSyncedAt).toLocaleString()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>Scopes: {account.scopes.join(", ")}</p>
              {metadata?.email && <p>Email: {metadata.email}</p>}
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
} | null

