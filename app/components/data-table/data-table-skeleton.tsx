import { HeaderGroup } from '@tanstack/react-table'
import { TableCell, TableRow } from '@shadcn/ui/table'
import { TableCellSkeletonsProps } from './types'
import { cn } from '@shadcn/lib/utils'

export const TableCellSkeletons = <TData,>({
  table,
  count,
  className,
}: TableCellSkeletonsProps<TData>) => {
  return Array.from({ length: count }).map((_, skeletonIndex) => {
    return table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
      <TableRow
        key={`${headerGroup.id}-${skeletonIndex}`}
        className={cn('border-border dark:hover:bg-muted', className)}>
        {headerGroup.headers.map((header) => {
          return (
            <TableCell
              key={`${header.id}-${skeletonIndex}`}
              className="text-foreground py-2 ps-4 font-semibold"
              style={{ width: header.column.columnDef.size }}>
              <div className="h-6 w-full animate-pulse rounded bg-muted dark:bg-muted-foreground/50"></div>
            </TableCell>
          )
        })}
      </TableRow>
    ))
  })
}
