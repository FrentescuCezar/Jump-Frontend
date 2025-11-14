/**
 * Cross-tab communication using BroadcastChannel API
 *
 * ⚠️ LIMITATIONS:
 * - Only works within the SAME browser instance on the SAME device
 * - Works across tabs/windows in the same browser
 * - Does NOT work across different devices (PC ↔ Mobile)
 * - Does NOT work across different browsers (Chrome ↔ Firefox)
 * - Does NOT work after browser restart
 *
 * For cross-device sync, you would need:
 * - WebSockets/Server-Sent Events (SSE) for real-time updates
 * - Polling the server periodically
 * - Or a service like Firebase Realtime Database, Supabase Realtime, etc.
 */

type BroadcastEvent = {
  type:
    | "planner-entry-created"
    | "planner-entry-updated"
    | "planner-entry-deleted"
  payload?: unknown
}

class BroadcastChannelManager {
  private channel: BroadcastChannel | null = null

  constructor(channelName: string) {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(channelName)
    }
  }

  post(event: BroadcastEvent) {
    if (this.channel) {
      this.channel.postMessage(event)
    }
  }

  subscribe(callback: (event: BroadcastEvent) => void) {
    if (!this.channel) return () => {}

    const handler = (e: MessageEvent<BroadcastEvent>) => {
      callback(e.data)
    }

    this.channel.addEventListener("message", handler)

    return () => {
      this.channel?.removeEventListener("message", handler)
    }
  }

  close() {
    this.channel?.close()
  }
}

// Singleton instance for planner events
export const plannerBroadcast = new BroadcastChannelManager("planner-events")
