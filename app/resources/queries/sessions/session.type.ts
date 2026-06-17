/**
 * Message direction: 'inbound' (user/channel) or 'outbound' (bot/gateway reply)
 */
export type MessageDirection = 'inbound' | 'outbound'

/**
 * A single message within a session (chat transcript item).
 * Messages are ordered by created_at ascending (oldest first).
 */
export type SessionMessageType = {
  id: string
  session_id: string
  direction: MessageDirection
  content: string
  provider_message_id: string | null
  reply_to: string | null
  metadata: Record<string, unknown>
  created_at: string
}

/**
 * Origin metadata describing where a session originated (DM, group, etc.)
 */
export type SessionOrigin = {
  label: string
  from: string
  to: string
  account_id: string
  thread_id: string | null
}

/**
 * The user associated with a session. The shape comes from the Conversa API and
 * may include additional fields beyond those listed here.
 */
export type SessionUser = {
  id?: string
  display_name?: string
  email?: string
  [key: string]: unknown
}

/**
 * Conversa chat session (list/detail item from the API)
 */
export type SessionType = {
  id: string
  session_key: string
  user_id: string | null
  user?: SessionUser | null
  channel: string
  account_id: string
  chat_id: string
  thread_id: string | null
  display_name: string
  origin: SessionOrigin | null
  last_message_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  messages?: SessionMessageType[]
  message_count: number
}
