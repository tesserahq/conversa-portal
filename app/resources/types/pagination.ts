export interface IPagingInfo {
  pages: number
  page: number
  size: number
  total: number
}

export interface IPaging<T> {
  items: T[]
  page: number
  pages: number
  size: number
  total: number
}
