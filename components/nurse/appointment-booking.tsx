'use client'
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
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"





import * as React from 'react'
import { Dialog, DialogContent, DialogHeader,
         DialogTitle, DialogFooter, DialogDescription }
         from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'








type Doctor = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
}

type Form = {
  id: string
  title: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: { id: string; first_name?: string | null; last_name?: string | null }
}

const doctorColumns: ColumnDef<Doctor>[] = [
  { accessorKey: 'first_name', header: 'First Name' },
  { accessorKey: 'last_name',  header: 'Last Name' },
  { accessorKey: 'email',      header: 'Email' }
]

const formColumns: ColumnDef<Form>[] = [
  { accessorKey: 'title', header: 'Form Title' }
]









export function BookingDialog({ open, onOpenChange, patient }: Props) {
  const [doctors, setDoctors] = React.useState<Doctor[]>([])
  const [forms, setForms] = React.useState<Form[]>([])
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>()
  const [selectedForm, setSelectedForm] = React.useState<string>()
  const [visitDate, setVisitDate] = React.useState<string>('')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})






  // load doctors & forms once the dialog is shown
  React.useEffect(() => {
    if (!open) return
    async function loadDoctors() {
      try {
        const res = await fetch(`/api/dbhandler?model=user&role=doctor`)
        setDoctors(await res.json())
      } catch {
        toast({ title: 'Failed to load doctors' })
      }
    }
    async function loadForms() {
      try {
        const res = await fetch(`/api/dbhandler?model=form`)
        setForms(await res.json())
      } catch {
        toast({ title: 'Failed to load forms' })
      }
    }
    loadDoctors()
    loadForms()
  }, [open])

  // doctor table (5 rows per page)
  const doctorTable = useReactTable({
    data: doctors,
    columns: doctorColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } }
  })

  // form table (5 rows per page)
  const formTable = useReactTable({
  data: forms,
  columns: formColumns,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  initialState: { pagination: { pageSize: 5 } },
  state: {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
  },
})

// When a row is selected, update the selectedForm state
React.useEffect(() => {
  const selectedIds = Object.keys(rowSelection)
  if (selectedIds.length === 1) {
    handleRowClick('form', selectedIds[0])
  }
}, [rowSelection])

  const handleRowClick = (type: 'doctor' | 'form', id: string) => {
    if (type === 'doctor') setSelectedDoctor(id)
    else setSelectedForm(id)
  }

  const handleSave = async () => {
    console.log('Saving appointment:', { visitDate, selectedDoctor, selectedForm, patient })
    if (!selectedDoctor) {
      toast({ title: 'Please select a doctor' })
      return
    }
    if (!selectedForm) {
      toast({ title: 'Please select a form' })
      return
    }
    if (!visitDate) {
      toast({ title: 'Please pick a visit date' })
      return
    }
    try {
      const payload = {
        visit_date: new Date(visitDate).toISOString(),
        patient_id: patient.id,
        medical_staff_id: selectedDoctor,
        form_id: selectedForm,          // optional – you can store it in a JSON field if you like
        visit_status: 'Scheduled'
      }
      const res = await fetch(`/api/dbhandler?model=appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast({ title: 'Appointment booked!' })
        onOpenChange(false)
      } else {
        const err = await res.json()
        toast({ title: err.error || 'Something went wrong' })
      }
    } catch {
      toast({ title: 'Network error' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Book appointment for {patient?.first_name ?? ''} {patient?.last_name ?? ''}
            </DialogTitle>
          <DialogDescription>
            Select a doctor, a form (if needed) and set the visit date.
          </DialogDescription>
        </DialogHeader>








        <div className="grid gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Select a Doctor</h4>
            <div className="rounded-md border">
              <div className="flex items-center py-4">
                <Input
                  placeholder="Filter doctors..."
                  value={(doctorTable.getColumn('email')?.getFilterValue() as string) ?? ''}
                  onChange={e => doctorTable.getColumn('email')?.setFilterValue(e.target.value)}
                  className="max-w-sm"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {doctorTable.getAllColumns().filter(c => c.getCanHide()).map(c => (
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

              <Table>
                <TableHeader>
                  {doctorTable.getHeaderGroups().map(hg => (
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
                  {doctorTable.getRowModel().rows.map(r => (
                    <TableRow
                      key={r.id}
                      data-state={r.original.id === selectedDoctor && 'selected'}
                      onClick={() => handleRowClick('doctor', r.original.id)}
                      className="cursor-pointer"
                    >
                      {r.getVisibleCells().map(c => (
                        <TableCell key={c.id}>
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => doctorTable.previousPage()} disabled={!doctorTable.getCanPreviousPage()}>
                Prev
              </Button>
              <Button size="sm" variant="outline" onClick={() => doctorTable.nextPage()} disabled={!doctorTable.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>












          <div className="space-y-2">
            <h4 className="text-sm font-medium">Select a Form (optional)</h4>

            <div className="rounded-md border">
              <div className="flex items-center py-4">
                <Input
                  placeholder="Filter forms..."
                  value={(formTable.getColumn('title')?.getFilterValue() as string) ?? ''}
                  onChange={e => formTable.getColumn('title')?.setFilterValue(e.target.value)}
                  className="max-w-sm"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {formTable.getAllColumns().filter(c => c.getCanHide()).map(c => (
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

              <Table>
                <TableHeader>
                  {formTable.getHeaderGroups().map(hg => (
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
                  {formTable.getRowModel().rows.map(r => (
                    <TableRow
                      key={r.id}
                      data-state={r.original.id === selectedForm && 'selected'}
                      onClick={() => handleRowClick('form', r.original.id)}
                      className="cursor-pointer"
                    >
                      {r.getVisibleCells().map(c => (
                        <TableCell key={c.id}>
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => formTable.previousPage()}
                disabled={!formTable.getCanPreviousPage()}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => formTable.nextPage()}
                disabled={!formTable.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>









          <div className="grid gap-2">
            <Label htmlFor="visit-date">Visit Date & Time</Label>
            <Input
              id="visit-date"
              type="datetime-local"
              value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
