import HomePage from "@/components/home/HomePage"

type HomePageProps = {
  params: Promise<{ locale: string }>
}

export default async function LocaleHome({ params }: HomePageProps) {
  await params

  return <HomePage />
}
