import { SessionMessageType } from '@/resources/queries/sessions/session.type'
import { cn } from '@shadcn/lib/utils'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { CornerDownRight } from 'lucide-react'

interface ChatTranscriptProps {
  messages: SessionMessageType[]
}

type MessageGroup = {
  /** First message's created_at in the group, used as the day reference. */
  date: string
  messages: SessionMessageType[]
}

/**
 * Groups consecutive messages by calendar day (WhatsApp-style).
 * Assumes messages are ordered oldest-first (ascending by created_at).
 */
function groupMessagesByDay(messages: SessionMessageType[]): MessageGroup[] {
  return messages.reduce<MessageGroup[]>((groups, message) => {
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && isSameDay(lastGroup.date, message.created_at)) {
      lastGroup.messages.push(message)
    } else {
      groups.push({ date: message.created_at, messages: [message] })
    }

    return groups
  }, [])
}

/**
 * Formats a day separator label like WhatsApp: "Today", "Yesterday",
 * or a full date for older days.
 */
function formatDaySeparator(date: string): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd MMMM yyyy')
}

/**
 * Renders a session's messages as a chat transcript.
 * Inbound messages (user/channel) align left; outbound (bot/gateway) align right.
 * Messages are grouped by calendar day with a date separator (WhatsApp-style).
 * Messages are expected to be ordered oldest-first (ascending by created_at).
 */
export function ChatTranscript({ messages }: ChatTranscriptProps) {
  const groups = groupMessagesByDay(messages)

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.date} className="flex flex-col gap-3">
          <DaySeparator date={group.date} />
          {group.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ))}
    </div>
  )
}

function DaySeparator({ date }: { date: string }) {
  return (
    <div className="flex justify-center mt-3">
      <span
        className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium
          shadow-sm">
        {formatDaySeparator(date)}
      </span>
    </div>
  )
}

function MessageBubble({ message }: { message: SessionMessageType }) {
  const isOutbound = message.direction === 'outbound'

  return (
    <div className={cn('flex w-full', isOutbound ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-1 rounded-lg px-4 py-2 text-sm shadow-sm',
          isOutbound
            ? 'bg-primary text-primary-foreground rounded-bl-sm rounded-tl-sm'
            : 'bg-muted text-foreground rounded-br-sm rounded-tr-sm'
        )}>
        {/* {message.reply_to && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs opacity-70',
              isOutbound ? 'justify-end' : 'justify-start'
            )}>
            <CornerDownRight size={12} />
            <span>Reply to {message.reply_to}</span>
          </div>
        )} */}
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        <div
          className={cn(
            'flex items-center gap-2 text-[10px] uppercase tracking-wide',
            isOutbound ? 'justify-end' : 'justify-end'
          )}>
          <span>{format(message.created_at, 'HH:mm')}</span>
        </div>
      </div>
    </div>
  )
}

export default ChatTranscript
