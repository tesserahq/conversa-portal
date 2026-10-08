import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { DomainEventCard } from '@/components/chat/domain-event-card'
import { ConversaChatTransport, type ConversaUIMessage } from '@/libraries/conversa-chat-transport'
import { useChat } from '@ai-sdk/react'
import { Button } from '@shadcn/ui/button'
import { Textarea } from '@shadcn/ui/textarea'
import { cn } from '@shadcn/lib/utils'
import { Loader2, Send } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useLoaderData } from 'react-router'
import { useApp } from 'tessera-ui'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

/**
 * Manual test page for POST /chat/completions (the direct chat API,
 * tesserahq/conversa#64-#67) — talks to Conversa directly from the browser
 * via a custom ChatTransport, not through a proxy, so this exercises the
 * same path a real integration would use.
 */
export default function ChatTestPage() {
  const { apiUrl } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [input, setInput] = useState('')

  const transport = useMemo(() => {
    if (!apiUrl || !token) return undefined
    return new ConversaChatTransport({
      apiUrl,
      token,
      sessionId,
      onSessionId: setSessionId,
    })
    // sessionId is intentionally included: once Conversa reports one, later
    // sends must carry it so the transport resumes the same session.
  }, [apiUrl, token, sessionId])

  if (isLoadingIdenties || !token || !transport) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <ChatTestPageContent
      transport={transport}
      sessionId={sessionId}
      input={input}
      setInput={setInput}
    />
  )
}

function ChatTestPageContent({
  transport,
  sessionId,
  input,
  setInput,
}: {
  transport: ConversaChatTransport
  sessionId: string | undefined
  input: string
  setInput: (value: string) => void
}) {
  const { messages, sendMessage, status, error } = useChat<ConversaUIMessage>({ transport })
  const scrollRef = useRef<HTMLDivElement>(null)
  const isBusy = status === 'submitted' || status === 'streaming'

  const handleSend = () => {
    const text = input.trim()
    if (!text || isBusy) return
    setInput('')
    sendMessage({ text })
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  return (
    <DetailContent
      title="Chat (test)"
      className="h-[calc(100vh-8rem)]"
      contentClassName="flex flex-col gap-4 overflow-hidden">
      {sessionId && (
        <p className="text-muted-foreground text-xs">
          Session: <span className="font-mono">{sessionId}</span>
        </p>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pe-2">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">Send a message to start a session.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}>
            <div
              className={cn(
                'max-w-[75%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap shadow-sm',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              )}>
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  return <span key={index}>{part.text}</span>
                }
                if (part.type === 'data-event') {
                  return <DomainEventCard key={part.id ?? part.data.id} event={part.data} />
                }
                return null
              })}
            </div>
          </div>
        ))}
        {status === 'submitted' && (
          <div className="flex justify-start">
            <Loader2 className="text-muted-foreground size-4 animate-spin" />
          </div>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error.message}</p>}

      <div className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Type a message..."
          className="min-h-[2.5rem] resize-none"
          rows={1}
        />
        <Button onClick={handleSend} disabled={isBusy || !input.trim()} size="icon">
          <Send className="size-4" />
        </Button>
      </div>
    </DetailContent>
  )
}
