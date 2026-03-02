export interface IPagingInfo {
  page_size: number
  current_page: number
  total_count: number
  total_pages: number
}

export interface IPaging<T> {
  data: T[]
  meta: IPagingInfo
  status: number
  message: string
}
