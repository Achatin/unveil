"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters,
        },
    })

    const handleExport = () => {
        const csvContent = [
            columns.map(col => col.header).join(","), // Header row
            ...table.getRowModel().rows.map(row =>
                row.getVisibleCells().map(cell => {
                    const cellValue = flexRender(cell.column.columnDef.cell, cell.getContext())
                    return typeof cellValue === "string" ? `"${cellValue.replace(/"/g, '""')}"` : cellValue
                }).join(",")
            )
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "annotations.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

  return (
    <div className="overflow-hidden border-t bg-background">
        <div className="flex justify-between items-center py-4 px-4">
            <Input
            placeholder="Filter labels..."
            value={(table.getColumn("label")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("label")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
            <Button variant="outline" onClick={handleExport}><Download />Export</Button>
        </div>
        <Table className="border-t">
            <TableHeader className="shadow h-16">
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                    <TableHead key={header.id} className="relative">
                    <div className="flex items-center gap-2">
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                    </div>
                    </TableHead>
                ))}
                </TableRow>
            ))}
            </TableHeader>

            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                <TableRow
                    key={row.id}
                    className={index % 2 === 1 ? "bg-muted/50" : ""}
                    data-state={row.getIsSelected() && "selected"}
                >
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  )
}