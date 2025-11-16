export type TranscriptEntry = {
  speaker: string
  text: string
  timestamp?: string
}

export type ParsedTranscript = {
  plainText: string
  entries: TranscriptEntry[]
}

export function parseTranscriptPayload(payload: unknown): ParsedTranscript {
  if (payload === null || payload === undefined) {
    return { plainText: "", entries: [] }
  }

  if (typeof payload === "string") {
    const trimmed = payload.trim()
    // Attempt to parse JSON strings
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed)
        return parseTranscriptPayload(parsed)
      } catch {
        // fall through to treat as plain text
      }
    }
    return {
      plainText: trimmed,
      entries: trimmed
        ? [{ speaker: "Transcript", text: trimmed }]
        : [],
    }
  }

  if (Array.isArray(payload)) {
    return normalizeTranscriptSegments(payload)
  }

  if (typeof payload === "object") {
    const segments = Array.isArray((payload as any).segments)
      ? ((payload as any).segments as unknown[])
      : null
    if (segments) {
      return normalizeTranscriptSegments(segments)
    }
    const serialized = JSON.stringify(payload, null, 2)
    return {
      plainText: serialized,
      entries: serialized
        ? [{ speaker: "Transcript", text: serialized }]
        : [],
    }
  }

  const asString = String(payload)
  return {
    plainText: asString,
    entries: asString ? [{ speaker: "Transcript", text: asString }] : [],
  }
}

function normalizeTranscriptSegments(
  segments: unknown[],
): ParsedTranscript {
  const entries: TranscriptEntry[] = []
  for (const segment of segments) {
    const entry = buildEntryFromSegment(segment)
    if (entry) {
      entries.push(entry)
    }
  }
  const plainText = entries.map((entry) => `${entry.speaker}: ${entry.text}`).join("\n")
  return { plainText, entries }
}

function buildEntryFromSegment(segment: unknown): TranscriptEntry | null {
  if (!segment || typeof segment !== "object") {
    return null
  }

  const source = segment as Record<string, any>
  const speaker =
    source.participant?.name ??
    source.participant?.email ??
    source.speaker ??
    "Speaker"

  const text =
    source.text ??
    source.message ??
    source.body ??
    joinTranscriptWords(source.words)

  if (!text || !String(text).trim()) {
    return null
  }

  const timestamp: string | undefined =
    source.start_timestamp?.absolute ??
    source.end_timestamp?.absolute ??
    source.timestamp ??
    undefined

  return {
    speaker,
    text: String(text).trim(),
    timestamp,
  }
}

function joinTranscriptWords(words: unknown): string | null {
  if (!Array.isArray(words)) {
    return null
  }
  const tokens = words
    .map((word) => (typeof word?.text === "string" ? word.text : null))
    .filter((value): value is string => Boolean(value))
  if (!tokens.length) {
    return null
  }
  return tokens.join(" ")
}

