import type { TesseraEvent } from '@/libraries/tessera-events'
import { Badge } from '@shadcn/ui/badge'
import { CheckCircle2 } from 'lucide-react'

type ResourceReference = {
  type: string
  id: string
}

/** Visible tracer for domain effects delivered through the chat event channel. */
export function DomainEventCard({ event }: { event: TesseraEvent }) {
  const resource = getResource(event.event_data)
  const eventName = humanizeEventType(event.event_type)

  return (
    <div className="border-border bg-background/70 my-1 rounded-md border px-3 py-2 shadow-sm">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{eventName}</span>
            {resource && <Badge variant="outline">{resource.type}</Badge>}
          </div>
          {resource && (
            <p
              className="text-muted-foreground mt-1 truncate font-mono text-xs"
              title={resource.id}>
              {resource.id}
            </p>
          )}
          <details className="text-muted-foreground mt-2 text-xs">
            <summary className="cursor-pointer select-none">Event details</summary>
            <pre
              className="bg-muted mt-2 max-h-48 overflow-auto rounded p-2 text-[11px]
                whitespace-pre-wrap">
              {JSON.stringify(event, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}

function humanizeEventType(eventType: string): string {
  const [resource = 'Resource', action = 'updated'] = eventType.split('.').slice(-2)
  return `${capitalize(resource)} ${action.replaceAll('_', ' ')}`
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getResource(eventData: unknown): ResourceReference | null {
  if (!isRecord(eventData) || !isRecord(eventData.resource)) return null
  const { type, id } = eventData.resource
  return typeof type === 'string' && typeof id === 'string' ? { type, id } : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
