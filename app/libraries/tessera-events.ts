import { z } from 'zod/v4'

/**
 * Stable Tessera event envelope exposed by Conversa's opt-in completion
 * event channel. Domain owners define event_type and event_data; this client
 * validates only the shared transport envelope so new domain events remain
 * forward-compatible.
 */
export const tesseraEventSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    spec_version: z.literal('1.0'),
    event_type: z.string().min(1),
    data_content_type: z.string().nullable().optional(),
    dataschema: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    event_data: z.unknown().optional(),
    user_id: z.string().nullable().optional(),
    labels: z.record(z.string(), z.unknown()).nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    project_id: z.string().nullable().optional(),
    privy: z.boolean().optional(),
  })
  .passthrough()

export type TesseraEvent = z.infer<typeof tesseraEventSchema>

export type ConversaChatData = {
  event: TesseraEvent
}
