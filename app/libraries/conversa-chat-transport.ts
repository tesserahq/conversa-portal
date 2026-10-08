import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai'
import { type ConversaChatData, type TesseraEvent, tesseraEventSchema } from './tessera-events'

export type ConversaUIMessage = UIMessage<unknown, ConversaChatData>

export interface ConversaChatTransportOptions {
  /** Conversa API base URL (same one used for /sessions elsewhere). */
  apiUrl: string
  /** Bearer token for the current user (Tessera JWT). */
  token: string
  /** Existing Conversa session id to resume, if any. */
  sessionId?: string
  /** Called whenever Conversa reports a session id (new or resumed). */
  onSessionId?: (sessionId: string) => void
}

/**
 * ChatTransport that talks directly to Conversa's POST /chat/completions
 * (OpenAI-shaped SSE, plus an optional session_id) rather than the AI SDK's
 * own UI-message-stream protocol. Converts chat.completion.chunk events
 * into the UIMessageChunk events useChat expects.
 */
export class ConversaChatTransport implements ChatTransport<ConversaUIMessage> {
  private apiUrl: string
  private token: string
  private sessionId?: string
  private onSessionId?: (sessionId: string) => void

  constructor(options: ConversaChatTransportOptions) {
    this.apiUrl = options.apiUrl
    this.token = options.token
    this.sessionId = options.sessionId
    this.onSessionId = options.onSessionId
  }

  async sendMessages(
    options: Parameters<ChatTransport<ConversaUIMessage>['sendMessages']>[0]
  ): Promise<ReadableStream<UIMessageChunk<unknown, ConversaChatData>>> {
    const { messages, abortSignal } = options

    const openAiMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role,
        content: m.parts
          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map((p) => p.text)
          .join(''),
      }))
      .filter((m) => m.content.length > 0)

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        messages: openAiMessages,
        stream: true,
        session_id: this.sessionId,
        include: ['events'],
      }),
      signal: abortSignal,
    })

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '')
      throw new Error(`Conversa chat request failed: ${response.status} ${detail}`)
    }

    const sessionId = response.headers.get('X-Conversa-Session-Id')
    if (sessionId && sessionId !== this.sessionId) {
      this.sessionId = sessionId
      this.onSessionId?.(sessionId)
    }

    return conversaSseToUIMessageChunks(response.body)
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    // Conversa doesn't support resuming an in-flight stream after reload.
    return null
  }
}

/** Parses Conversa's OpenAI-shaped SSE body into UIMessageChunk events. */
function conversaSseToUIMessageChunks(
  body: ReadableStream<Uint8Array>
): ReadableStream<UIMessageChunk<unknown, ConversaChatData>> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let textPartId: string | null = null
  let started = false
  let finished = false

  const finish = (
    controller: ReadableStreamDefaultController<UIMessageChunk<unknown, ConversaChatData>>
  ) => {
    if (finished) return
    finished = true
    if (textPartId) {
      controller.enqueue({ type: 'text-end', id: textPartId })
      textPartId = null
    }
    controller.enqueue({ type: 'finish' })
    controller.close()
  }

  return new ReadableStream<UIMessageChunk<unknown, ConversaChatData>>({
    async pull(controller) {
      if (finished) return

      const { done, value } = await reader.read()
      if (done) {
        finish(controller)
        return
      }

      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''

      for (const frame of frames) {
        const line = frame.trim()
        if (!line.startsWith('data:')) continue
        const data = line.slice('data:'.length).trim()

        if (data === '[DONE]') {
          finish(controller)
          return
        }

        let chunk: {
          choices?: { delta?: { role?: string; content?: string }; finish_reason?: string | null }[]
          extensions?: { event?: unknown }
        }
        try {
          chunk = JSON.parse(data)
        } catch {
          controller.enqueue({ type: 'error', errorText: `Malformed chunk: ${data}` })
          continue
        }

        if (!started) {
          controller.enqueue({ type: 'start' })
          started = true
        }

        if (chunk.extensions?.event !== undefined) {
          const parsedEvent = tesseraEventSchema.safeParse(chunk.extensions.event)
          if (!parsedEvent.success) {
            controller.enqueue({
              type: 'error',
              errorText: 'Conversa returned an invalid domain event.',
            })
            continue
          }
          controller.enqueue(toEventChunk(parsedEvent.data))
        }

        const delta = chunk.choices?.[0]?.delta
        if (delta?.content) {
          if (!textPartId) {
            textPartId = crypto.randomUUID()
            controller.enqueue({ type: 'text-start', id: textPartId })
          }
          controller.enqueue({ type: 'text-delta', id: textPartId, delta: delta.content })
        }
      }
    },
    cancel() {
      reader.cancel()
    },
  })
}

function toEventChunk(event: TesseraEvent): UIMessageChunk<unknown, ConversaChatData> {
  return {
    type: 'data-event',
    id: event.id,
    data: event,
  }
}
