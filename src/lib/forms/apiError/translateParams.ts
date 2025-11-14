import type { TIntl } from "./types"

/**
 * Translate resource/service params from Common.resources if available.
 */
function translateParam(
  key: string,
  value: unknown,
  t: TIntl,
): string {
  const strValue = String(value)

  if (key === "resource" || key === "service") {
    try {
      const translated = t(`Common.resources.${strValue}`)
      return translated !== `Common.resources.${strValue}` ? translated : strValue
    } catch {
      return strValue
    }
  }

  return strValue
}

/**
 * Process and translate error params, ensuring required defaults.
 */
export function processErrorParams(
  params: Record<string, unknown> | undefined,
  code: string,
  t: TIntl,
): Record<string, string> {
  const finalParams: Record<string, string> = {}

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      finalParams[key] = translateParam(key, value, t)
    })
  }

  if (code === "NOT_FOUND" && !finalParams.resource) {
    finalParams.resource = t("Common.resources.Endpoint")
  }

  if (code === "SERVICE_UNAVAILABLE" && !finalParams.service) {
    finalParams.service = t("Common.resources.Service")
  }

  return finalParams
}

