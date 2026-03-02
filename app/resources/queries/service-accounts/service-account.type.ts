/**
 * Service Account Type
 */

export type ServiceAccountType = {
  id: string
  email: string
  avatar_url: string
  avatar_asset_id: string
  first_name: string
  last_name: string
  provider: string
  confirmed_at: string
  verified: boolean
  verified_at: string
  theme_preference: string
  created_at: string
  updated_at: string
  external_id: string
  service_account: boolean
}
