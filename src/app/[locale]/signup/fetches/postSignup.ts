"use server"

import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"

/**
 * DTO for signup request
 */
export interface SignupDTO {
  firstName: string
  lastName?: string
  email: string
  password: string
  brand: string
}

/**
 * POST /signup
 * Creates a new user account.
 */
export async function postSignup(dto: SignupDTO): Promise<void> {
  await authFetch<void>(`${env.backendUrl}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  })
}
