import { z } from "zod"
import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"
import {
  MeetingActivitySchema,
  MeetingDetailsSchema,
  MeetingPreferenceSchema,
  MeetingShareSchema,
} from "@/schemas/meetings/details"

export const meetingsBaseUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/meetings`
}

const socialBaseUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/social`
}

export async function fetchMeetingDetails(meetingId: string) {
  const response = await authFetch<unknown>(
    `${meetingsBaseUrl()}/${meetingId}/details`,
  )
  return MeetingDetailsSchema.parse(response)
}

export async function fetchMeetingTranscript(meetingId: string) {
  return authFetch<unknown>(
    `${meetingsBaseUrl()}/${meetingId}/media/transcript`,
  )
}

export type MeetingRecordingResponse = {
  downloadUrl: string
  expiresAt: string | null
}

export async function fetchMeetingRecording(
  meetingId: string,
): Promise<MeetingRecordingResponse> {
  return authFetch<MeetingRecordingResponse>(
    `${meetingsBaseUrl()}/${meetingId}/media/video`,
  )
}

export async function regenerateMeetingContent(meetingId: string) {
  return authFetch<{ success: boolean }>(
    `${meetingsBaseUrl()}/${meetingId}/ai/regenerate`,
    {
      method: "POST",
    },
  )
}

export async function publishSocialPost(postId: string) {
  return authFetch<{ post: unknown }>(`${socialBaseUrl()}/publish/${postId}`, {
    method: "POST",
  })
}

export async function fetchMeetingPreference() {
  const response = await authFetch<unknown>(`${meetingsBaseUrl()}/preferences`)
  return MeetingPreferenceSchema.parse(response)
}

export async function updateMeetingPreference(input: { leadMinutes: number }) {
  const response = await authFetch<unknown>(
    `${meetingsBaseUrl()}/preferences`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  )
  return MeetingPreferenceSchema.parse(response)
}

export async function fetchMeetingActivity(meetingId: string) {
  const response = await authFetch<unknown>(
    `${meetingsBaseUrl()}/${meetingId}/activity`,
  )
  return MeetingActivitySchema.parse(response)
}

export async function fetchMeetingShares(meetingId: string) {
  const response = await authFetch<unknown>(
    `${meetingsBaseUrl()}/${meetingId}/shares`,
  )
  return z.array(MeetingShareSchema).parse(response)
}

export async function createMeetingShare(
  meetingId: string,
  input: { email: string },
) {
  const response = await authFetch<unknown>(
    `${meetingsBaseUrl()}/${meetingId}/shares`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  )
  return MeetingShareSchema.parse(response)
}
