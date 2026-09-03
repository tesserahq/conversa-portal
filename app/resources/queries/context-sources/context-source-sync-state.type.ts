/**
 * Per (source, user) sync state row.
 */
export type ContextSourceSyncStateType = {
  user_id: string
  user_email: string | null
  last_success_at: string | null
  last_attempt_at: string | null
  last_error: string | null
  next_run_at: string | null
  etag: string | null
}

/**
 * Response of a manual context sync trigger.
 */
export type TriggerContextSyncResponse = {
  user_id: string
  status: string
}
