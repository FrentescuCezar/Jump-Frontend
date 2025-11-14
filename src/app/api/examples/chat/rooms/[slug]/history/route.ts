import { NextResponse } from "next/server"
import { fetchChatHistory } from "@/features/examples/chat/api"

type RouteProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ before?: string }>
}

export async function GET(_: Request, { params, searchParams }: RouteProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const history = await fetchChatHistory(slug, {
    before: query.before,
    limit: 30,
  })
  return NextResponse.json(history)
}

