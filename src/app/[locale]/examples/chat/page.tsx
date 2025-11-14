import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/auth"
import { fetchChatHistory, fetchChatRooms } from "@/features/examples/chat/api"
import ChatClient from "./components/ChatClient"
import { issueChatTokenAction } from "./actions/issueChatTokenAction"

type ChatPageProps = {
  params: Promise<{ locale: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const [{ locale }, session] = await Promise.all([params, getSession()])
  const t = await getTranslations("Examples.Chat")

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const rooms = await fetchChatRooms()
  const initialRoom = rooms[0]?.slug ?? null
  const history = initialRoom
    ? await fetchChatHistory(initialRoom, { limit: 100 })
    : null
  const token = await issueChatTokenAction()

  return (
    <div className="space-y-6">
      <section className="border-b bg-muted/20 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm uppercase tracking-wide text-primary">
            {t("badge")}
          </p>
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>
      <ChatClient
        rooms={rooms}
        initialRoom={initialRoom}
        initialMessages={history?.messages ?? []}
        initialCursor={history?.nextCursor ?? null}
        token={token}
        userId={session.user.id}
        displayName={session.user.name ?? session.user.email ?? "You"}
      />
    </div>
  )
}

