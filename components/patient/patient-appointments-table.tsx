// @ts-nocheck
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
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { useAppContext } from '@/hooks/useAppContext'

type Appointment = {
  id: string
  visit_date: string
  visit_status: 'Scheduled' | 'Completed' | 'Canceled'
  medical_staff: {
    users: {
      first_name: string
      last_name: string
    }
  }
  form?: {
    id: string
    title: string
    fields: Record<string, any>
  }
}

export default function PatientAppointmentsTable({
  appointments,
}: {
  appointments: any[]
}) {
  const { user } = useAppContext()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)

  console.log('All appointments:', appointments);

  // Filter appointments for the current patient
  const patientAppointments = React.useMemo(
    () => appointments.filter(appt => appt.patient_id == user?.id),
    [appointments, user?.id],
  )

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'visit_date',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.visit_date),
    },
    {
      accessorKey: 'visit_time',
      header: 'Time',
      cell: ({ row }) => formatTime(row.original.visit_date),
    },
    {
      accessorKey: 'doctor',
      header: 'Doctor',
      cell: ({ row }) => `Dr. ${row.original.medical_staff?.first_name} ${row.original.medical_staff?.last_name}`,
    },
    {
      accessorKey: 'visit_status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusVariant(row.original.visit_status)}>{row.original.visit_status}</Badge>
      ),
    },
    {
      id: 'actions',
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
            <DropdownMenuItem onClick={() => handleView(row.original)}>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data: patientAppointments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 5 },
    },
  })

  const getStatusVariant = (status: 'Scheduled' | 'Completed' | 'Canceled') => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500 text-white'
      case 'Canceled':
        return 'bg-red-500 text-white'
      case 'Scheduled':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-card'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'MMMM d, yyyy')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'HH:mm')
  }

  const handleView = (appt: Appointment) => {
    setSelectedAppointment(appt)
    setDialogOpen(true)
  }

  const handleSubmitForm = async (values: Record<string, any>) => {
    if (!selectedAppointment?.form) return

    try {
      const res = await fetch(`/api/dbhandler?model=form&id=${selectedAppointment.form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { ...selectedAppointment.form.fields, ...values } }),
      })

      if (res.ok) {
        toast({ title: 'Form submitted successfully!' })
        setDialogOpen(false)
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Failed to submit form' })
      }
    } catch {
      toast({ title: 'Network error' })
    }
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <div className="grid gap-4">
                  <div>
                    <Label>Date</Label>
                    <p>{formatDate(selectedAppointment.visit_date)}</p>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <p>{formatTime(selectedAppointment.visit_date)}</p>
                  </div>
                  <div>
                    <Label>Doctor</Label>
                    <p>
                      {selectedAppointment.medical_staff.users.first_name}{' '}
                      {selectedAppointment.medical_staff.users.last_name}
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusVariant(selectedAppointment.visit_status)}>
                      {selectedAppointment.visit_status}
                    </Badge>
                  </div>

                  {selectedAppointment.form && (
                    <div className="space-y-2">
                      <h4 className="font-medium">{selectedAppointment.form.title}</h4>
                      <form
                        onSubmit={e => {
                          e.preventDefault()
                          const formData: Record<string, any> = {}
                          selectedAppointment.form?.fields &&
                            Object.keys(selectedAppointment.form.fields).forEach(key => {
                              const input = (e.target as HTMLFormElement)[key]
                              if (input) formData[key] = (input as HTMLInputElement).value
                            })
                          handleSubmitForm(formData)
                        }}
                        className="space-y-4"
                      >
                        {selectedAppointment.form.fields &&
                          Object.entries(selectedAppointment.form.fields).map(([key, val]) => (
                            <div key={key}>
                              <Label htmlFor={key}>{key}</Label>
                              <Input defaultValue={val as string} id={key} name={key} />
                            </div>
                          ))}
                        <Button type="submit">Submit Form</Button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <Card className="sm:col-span-2 order-1 lg:order-none shadow-lg">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Your confirmed appointments with a doctor</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex items-center py-4 px-4">
            <Input
              placeholder="Filter by date..."
              value={(table.getColumn('visit_date')?.getFilterValue() as string) ?? ''}
              onChange={event => table.getColumn('visit_date')?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter(col => col.getCanHide()).map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={value => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => row.toggleSelected()}
                    className="cursor-pointer hover:bg-muted transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4 px-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
