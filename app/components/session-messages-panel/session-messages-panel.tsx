import { ChatTranscript } from '@/components/chat-transcript'
import { DetailContent } from '@/components/detail-content'
import { AppPreloader } from '@/components/loader/pre-loader'
import { useSessionMessagesInfinite } from '@/resources/hooks/sessions/use-session'
import { IQueryConfig } from '@/resources/queries'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { EmptyContent } from 'tessera-ui/components'

interface SessionMessagesPanelProps {
  config: IQueryConfig
  sessionId: string
  /** Defer fetching until auth/identities are ready. */
  enabled?: boolean
  title?: string
  /** Outer wrapper class — controls the panel height. */
  className?: string
}

/**
 * Self-contained messages panel: fetches a session's messages (paginated via the
 * `size` URL search param) and renders them as a scrollable chat transcript with
 * loading, error and empty states. Additional pages are loaded automatically when
 * the user scrolls to the bottom; when there is only a single page nothing extra
 * is fetched.
 */
export function SessionMessagesPanel({
  config,
  sessionId,
  enabled = true,
  title = 'Messages',
  className = 'h-[calc(100vh-12rem)]',
}: SessionMessagesPanelProps) {
  const [searchParams] = useSearchParams()
  const size = Number(searchParams.get('size')) || 50

  const { data, isLoading, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSessionMessagesInfinite(config, sessionId, { size }, { enabled })

  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const messages = data?.pages.flatMap((page) => page.items) ?? []

  // Auto-load the next page when the bottom sentinel scrolls into view.
  // `hasNextPage` is false on the last/only page, so the observer is never set
  // up in those cases and no extra fetch is triggered.
  useEffect(() => {
    const root = scrollRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !hasNextPage) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { root, rootMargin: '120px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderBody = () => {
    if (isLoading) {
      return <AppPreloader className="flex-1" />
    }

    if (error) {
      return (
        <EmptyContent
          image="/images/empty-session.png"
          title="Failed to get messages"
          description={error.message}
        />
      )
    }

    if (messages.length === 0) {
      return (
        <EmptyContent
          image="/images/empty-session.png"
          title="No messages yet"
          description="This session doesn't have any messages."
        />
      )
    }

    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto pe-2">
        <ChatTranscript messages={messages} />
        <div ref={sentinelRef} aria-hidden className="h-px" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        )}
      </div>
    )
  }

  return (
    <DetailContent
      title={title}
      className={className}
      contentClassName="flex flex-col gap-4 overflow-hidden">
      {renderBody()}
    </DetailContent>
  )
}

export default SessionMessagesPanel
