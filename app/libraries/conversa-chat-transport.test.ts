import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import type { UIMessageChunk } from 'ai'
import { ConversaChatTransport, type ConversaUIMessage } from './conversa-chat-transport'
import type { ConversaChatData } from './tessera-events'

const encoder = new TextEncoder()
const originalFetch = globalThis.fetch

function sseResponse(frames: string[]) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        frames.forEach((frame) => controller.enqueue(encoder.encode(frame)))
        controller.close()
      },
    }),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
  )
}

async function readChunks(stream: ReadableStream<UIMessageChunk<unknown, ConversaChatData>>) {
  const chunks: UIMessageChunk<unknown, ConversaChatData>[] = []
  const reader = stream.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return chunks
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('ConversaChatTransport', () => {
  it('requests events while preserving the session-aware chat contract', async () => {
    let request: { input: RequestInfo | URL; init?: RequestInit } | undefined
    globalThis.fetch = async (input, init) => {
      request = { input, init }
      return sseResponse([
        'data: {"choices":[{"delta":{"content":"Created."}}]}\n\n',
        'data: [DONE]\n\n',
      ])
    }
    const messages: ConversaUIMessage[] = [
      { id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Create Jane' }] },
    ]
    const transport = new ConversaChatTransport({
      apiUrl: 'https://conversa.example/api',
      token: 'access-token',
      sessionId: 'session-1',
    })

    const stream = await transport.sendMessages({
      trigger: 'submit-message',
      chatId: 'chat-1',
      messageId: undefined,
      messages,
      abortSignal: undefined,
    })

    assert.equal(request?.input, 'https://conversa.example/api/chat/completions')
    assert.deepEqual(JSON.parse(String(request?.init?.body)), {
      messages: [{ role: 'user', content: 'Create Jane' }],
      stream: true,
      session_id: 'session-1',
      include: ['events'],
    })
    assert.deepEqual(
      (await readChunks(stream)).map((chunk) => chunk.type),
      ['start', 'text-start', 'text-delta', 'text-end', 'finish']
    )
  })

  it('converts an interleaved Tessera event into typed message data', async () => {
    const event = {
      id: 'evt-1',
      source: '/linden',
      spec_version: '1.0',
      event_type: 'com.linden.person.created',
      event_data: {
        resource: { type: 'person', id: 'person-1' },
        related: [{ type: 'account', id: 'account-1' }],
      },
      tags: ['origin:mcp'],
    }
    globalThis.fetch = async () =>
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Created. "}}]}\n\n',
        `data: ${JSON.stringify({ choices: [], extensions: { event } })}\n\n`,
        'data: {"choices":[{"delta":{"content":"Anything else?"}}]}\n\n',
        'data: [DONE]\n\n',
      ])
    const transport = new ConversaChatTransport({
      apiUrl: 'https://conversa.example/api',
      token: 'access-token',
    })

    const stream = await transport.sendMessages({
      trigger: 'submit-message',
      chatId: 'chat-1',
      messageId: undefined,
      messages: [{ id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Create Jane' }] }],
      abortSignal: undefined,
    })
    const chunks = await readChunks(stream)

    assert.deepEqual(
      chunks.map((chunk) => chunk.type),
      ['start', 'text-start', 'text-delta', 'data-event', 'text-delta', 'text-end', 'finish']
    )
    assert.deepEqual(
      chunks.find((chunk) => chunk.type === 'data-event'),
      { type: 'data-event', id: 'evt-1', data: event }
    )
  })

  it('reports malformed event envelopes without exposing them as message data', async () => {
    globalThis.fetch = async () =>
      sseResponse([
        'data: {"choices":[],"extensions":{"event":{"id":"incomplete"}}}\n\n',
        'data: [DONE]\n\n',
      ])
    const transport = new ConversaChatTransport({
      apiUrl: 'https://conversa.example/api',
      token: 'access-token',
    })

    const stream = await transport.sendMessages({
      trigger: 'submit-message',
      chatId: 'chat-1',
      messageId: undefined,
      messages: [{ id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }],
      abortSignal: undefined,
    })

    assert.deepEqual(await readChunks(stream), [
      { type: 'start' },
      { type: 'error', errorText: 'Conversa returned an invalid domain event.' },
      { type: 'finish' },
    ])
  })
})
