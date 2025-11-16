"use server"

import { getTranslations } from "next-intl/server"
import { postSignup } from "../fetches/postSignup"
import { SignupSchema } from "@/schemas/signup/signup"
import { validateWithZod, success, failure, Val, Res } from "@/lib/forms"

export async function signupAction(
  _prev: Res<typeof SignupSchema>,
  values: Val<typeof SignupSchema>,
): Promise<Res<typeof SignupSchema>> {
  const tGlobal = await getTranslations()
  const tForm = await getTranslations("Signup")

  const validation = validateWithZod(SignupSchema, values, tGlobal, tForm)
  if (!validation.ok) return validation

  try {
    await postSignup({
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      email: validation.data.email,
      password: validation.data.password,
    })

    return success(values)
  } catch (error) {
    return failure(error, tGlobal, tForm, values)
  }
}
