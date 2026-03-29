import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type TableOptions,
} from "@tanstack/react-table";

import { cn } from "./utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

type DataTableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

interface DataTableProps<TData extends RowData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  getRowId?: TableOptions<TData>["getRowId"];
  headerRowClassName?: string;
  rowClassName?: string;
  tableClassName?: string;
}

function getColumnMeta<TData extends RowData, TValue>(
  column: ColumnDef<TData, TValue>,
) {
  return column.meta as DataTableColumnMeta | undefined;
}

function DataTable<TData extends RowData, TValue>({
  columns,
  data,
  emptyMessage = "No results.",
  getRowId,
  headerRowClassName,
  rowClassName,
  tableClassName,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  return (
    <Table className={tableClassName}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className={cn("hover:bg-transparent", headerRowClassName)}
          >
            {headerGroup.headers.map((header) => {
              const meta = getColumnMeta(header.column.columnDef);

              return (
                <TableHead key={header.id} className={meta?.headerClassName}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className={rowClassName}>
              {row.getVisibleCells().map((cell) => {
                const meta = getColumnMeta(cell.column.columnDef);

                return (
                  <TableCell key={cell.id} className={meta?.cellClassName}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={table.getVisibleLeafColumns().length}
              className="h-24 text-center"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export { DataTable };
