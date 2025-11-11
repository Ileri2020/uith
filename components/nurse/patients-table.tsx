'use client'
import * as React from 'react'
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState,
         flexRender, getCoreRowModel, getFilteredRowModel,
         getPaginationRowModel, getSortedRowModel, useReactTable }
         from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuCheckboxItem,
         DropdownMenuContent, DropdownMenuItem,
         DropdownMenuLabel, DropdownMenuTrigger }
         from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead,
         TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'

import { BookingDialog } from './appointment-booking'

type Patient = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  createdAt: Date
}

export const patientColumns: ColumnDef<Patient>[] = [
  { id: 'select',
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
    enableHiding: false,
  },
  { accessorKey: 'first_name',
    header: 'First Name',
    cell: ({ row }) => row.getValue('first_name') ?? '—'
  },
  { accessorKey: 'last_name',
    header: 'Last Name',
    cell: ({ row }) => row.getValue('last_name') ?? '—'
  },
  { accessorKey: 'email',
    header: ({ column }) => (
      <Button variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Email <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
  { accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Created <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString()
  },
  { id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(row.original.id)}>
            Copy ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
]

export function PatientTable() {
  const [patients, setPatients] = React.useState<Patient[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [openDialog, setOpenDialog] = React.useState(false)
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null)

  // fetch patients (role = PATIENT) ordered newest‑first
  React.useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch(
          `/api/generic?model=user&role=PATIENT&orderBy=createdAt&orderDir=desc`
        )
        const data = await res.json()
        setPatients(data)
      } catch {
        toast({ title: 'Failed to load patients' })
      }
    }
    loadPatients()
  }, [])

  const table = useReactTable({
    data: patients,
    columns: patientColumns,
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

  // when a row is clicked, open the booking dialog
  React.useEffect(() => {
    const selectedIds = Object.keys(rowSelection)
    if (selectedIds.length === 1) {
      const pat = patients.find(p => p.id === selectedIds[0])
      setSelectedPatient(pat ?? null)
      setOpenDialog(true)
    } else {
      setSelectedPatient(null)
      setOpenDialog(false)
    }
  }, [rowSelection, patients])

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name or email..."
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={e => table.getColumn('email')?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns()
                   .filter(c => c.getCanHide())
                   .map(c => (
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
                <TableCell colSpan={patientColumns.length} className="h-24 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {selectedPatient && (
        <BookingDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          patient={selectedPatient}
        />
      )}
    </div>
  )
}
