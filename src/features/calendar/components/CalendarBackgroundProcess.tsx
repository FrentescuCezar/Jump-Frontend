import { getSession } from "@/auth"
import { CalendarBackgroundClient } from "./CalendarBackgroundClient"

type CalendarBackgroundProcessProps = {
  locale: string
}

export async function CalendarBackgroundProcess({
  locale,
}: CalendarBackgroundProcessProps) {
  const session = await getSession()
  if (!session?.user?.id) {
    return null
  }

  return (
    <CalendarBackgroundClient userId={session.user.id} locale={locale} />
  )
}


