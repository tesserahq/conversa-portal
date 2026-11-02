import { IPagingInfo } from '@/resources/types'
import type {
  LegacyColumnDef as ColumnDef,
  LegacyTable as ReactTableType,
  LegacyTable as ReactTable,
} from '@tanstack/react-table/legacy'
import type { RowData } from '@tanstack/react-table'

export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<TData>[]
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

export type TableCellSkeletonsProps<TData extends RowData> = {
  table: ReactTable<TData>
  count: number
  className?: string
}
