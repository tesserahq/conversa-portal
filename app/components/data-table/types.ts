import { IPagingInfo } from '@/resources/types'
import { ColumnDef, Table as ReactTableType } from '@tanstack/react-table'
import type { Table as ReactTable } from '@tanstack/react-table'

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: IPagingInfo
  empty?: React.ReactNode
  fixed?: boolean
  isLoading?: boolean
  hasFilter?: boolean
  table?: ReactTableType<TData>
  onTableReady?: (table: ReactTableType<TData>) => void
  paginationScope?: string
  callbackPagination?: ({ page, size }: { page: number; size: number }) => void
}

export type TableCellSkeletonsProps<TData> = {
  table: ReactTable<TData>
  count: number
  className?: string
}
