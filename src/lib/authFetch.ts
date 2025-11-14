import { getAccessToken } from "@/auth"
import { ApiError, ApiErrorBody } from "@/lib/forms/apiError"

/**
 * A safe wrapper around native `fetch` for **authenticated API calls**.
 *
 * @remarks
 * This function:
 * - Attaches a bearer token from {@link getAccessToken}.
 * - Parses JSON automatically if the `Content-Type` is `application/json`.
 * - Handles empty responses (`204 No Content` or `Content-Length: 0`).
 * - Throws a unified {@link ApiError} on:
 *   1. **Non‑2xx responses** → includes parsed body if available.
 *   2. **Network/transport failures** (e.g. ECONNREFUSED, DNS issue).
 *      In this case, it throws with:
 *      - `status = 0`
 *      - `body.code = "NETWORK_ERROR"`
 *
 * @whyStatus0
 * **Why `status = 0`?**
 * There is no HTTP response in these cases, so `0` is used as a sentinel
 * value to distinguish transport errors from real HTTP response codes.
 *
 * @example Success
 * ```ts
 * interface User { id: string; name: string }
 *
 * const user = await authFetch<User>("/api/users/123");
 * console.log(user.name);
 * ```
 *
 * @example Error handling
 * ```ts
 * try {
 *   await authFetch("/api/broken");
 * } catch (err) {
 *   if (err instanceof ApiError && err.status === 0) {
 *     // Network problem → show toast: "Cannot connect to server"
 *   }
 * }
 * ```
 */
export async function authFetch<T>(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken()
  const headers = new Headers(init.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let res: Response

  try {
    res = await fetch(input, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers,
    })
  } catch {
    throw new ApiError(0, { code: "NETWORK_ERROR" })
  }

  if (res.ok) {
    const contentLength = res.headers.get("content-length")
    if (res.status === 204 || contentLength === "0") {
      return undefined as unknown as T
    }

    const contentType = res.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      return res.json() as Promise<T>
    }

    const text = await res.text()
    return text as unknown as T
  }

  let body: ApiErrorBody = { code: "NETWORK_ERROR" }
  try {
    body = (await res.json()) as ApiErrorBody
  } catch {
    // ignore — fallback to NETWORK_ERROR
  }

  throw new ApiError(res.status, body)
}
