// AppointmentTable.tsx
'use client'
import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { AppointmentDialog } from './AppointmentDialog'
import { appointmentColumns, AppointmentLite } from './appointmentColumns'

export default function AppointmentTable() {
  const [appointments, setAppointments] = React.useState<AppointmentLite[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'visit_date', desc: true }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [openDialog, setOpenDialog] = React.useState(false)
  const [selectedAppointment, setSelectedAppointment] = React.useState<AppointmentLite | null>(null)

  // load appointments (include patient & medical_staff on server side)
  React.useEffect(() => {
    async function loadAppointments() {
      try {
        const res = await fetch('/api/dbhandler?model=appointment&orderBy=visit_date&orderDir=desc')
        if (!res.ok) {
          toast({ title: 'Failed to load appointments' })
          return
        }
        const data = await res.json()
        // Normalize dates to strings to avoid serialization issues in the table
        const normalized = data.map((a: any) => ({ ...a, visit_date: a.visit_date }))
        setAppointments(normalized)
      } catch (err) {
        console.error(err)
        toast({ title: 'Failed to load appointments' })
      }
    }
    loadAppointments()
  }, [])

  const columns = React.useMemo<ColumnDef<AppointmentLite>[]>(() => {
    // Use appointmentColumns but remove the dummy select col and map to actual columns used here
    // We'll create a real select column here similarly to your patient table
    const selectCol: ColumnDef<AppointmentLite> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={v => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    }
    return [
      selectCol,
      ...appointmentColumns.filter(c => c.id !== 'select') as ColumnDef<AppointmentLite>[]
    ]
  }, [])

  const table = useReactTable({
    data: appointments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: 10 } }
  })

  // when a single row is selected, open the dialog (mirrors your patient table logic)
  React.useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length === 1) {
      const ap = selectedRows[0].original
      const full = appointments.find(a => a.id === ap.id) ?? ap
      setSelectedAppointment(full)
      setOpenDialog(true)
    } else {
      setSelectedAppointment(null)
      setOpenDialog(false)
    }
  }, [rowSelection, table, appointments])

  return (
    <div className="w-full max-w-5xl mx-auto shadow-lg bg-secondary rounded-lg p-1">
      <AppointmentDialog open={openDialog} onOpenChange={setOpenDialog} appointment={selectedAppointment ?? null} />
      <div className="text-lg font-semibold mx-3">All Appointments</div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by patient, staff or status..."
          value={(table.getColumn('visit_status')?.getFilterValue() as string) ?? ''}
          onChange={e => {
            // naively set visit_status column filter - also could add a global filter if desired
            table.getColumn('visit_status')?.setFilterValue(e.target.value)
          }}
          className="max-w-sm mr-2"
        />
        <div className="ml-auto" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter(c => c.getCanHide()).map(c => (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={c.getIsVisible()}
                onCheckedChange={v => c.toggleVisibility(!!v)}
              >
                {c.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(r => (
                <TableRow
                  key={r.id}
                  data-state={r.getIsSelected() && 'selected'}
                  onClick={() => r.toggleSelected()}
                  className="cursor-pointer"
                >
                  {r.getVisibleCells().map(c => (
                    <TableCell key={c.id}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
