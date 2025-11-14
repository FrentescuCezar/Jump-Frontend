import { getTranslations } from "next-intl/server"
import SignupForm from "./components/SignupForm"

export default async function SignupPage() {
  const t = await getTranslations("Signup")

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("title", { brand: "Example" })}</h1>
        </div>

        <SignupForm />
      </div>
    </div>
  )
}

