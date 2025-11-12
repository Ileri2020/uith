'use client'

import React, { useState, useEffect, useCallback } from 'react'
import PatientInfoCard from '@/components/patient/patient-info-card'
import AppointmentCalendarCard from '@/components/patient/appointment-calendar-card'
import BillingSummaryTable from '@/components/patient/billing-summary-table'
import SummaryStatsCard from '@/components/patient/summary-stats-card'
import { Skeleton } from '@/components/ui/skeleton'
import { getGreeting } from '@/utils/greeting'
import ErrorPage from '@/app/error'
import { useAppContext } from '@/hooks/useAppContext'
import PatientAppointmentsTable from '@/components/patient/patient-appointments-table'

function SkeletonLoader() {
  return (
    <div className="flex flex-col w-full gap-4 px-4 py-10 container mx-auto @container">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-1/3" />
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <div className="hidden sm:grid gap-4 md:grid-cols-2 col-span-2">
          <Skeleton className="h-40" />
        </div>
      </section>
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  )
}

export default function PatientDashboard() {
  interface PatientProfile {
    blood_type: string
    emergency_contact_id: number | null
    users: {
      address: string
      last_name: string
      first_name: string
      national_id: number
      phone_number: string
      date_of_birth: string
    }
  }

  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(
    null,
  )
  const [appointments, setAppointments] = useState([])
  const [billing, setBilling] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {user} = useAppContext()

  const mockpatientinfo = {
    blood_type: 'A+',
    emergency_contact_id: 101,
    users: {
      address: '123 Health St, Bangkok, Thailand',
      last_name: 'Smith',
      first_name: 'John',
      national_id: 1234567890123,
      phone_number: '0812345678',
      date_of_birth: '1985-06-15',
    },
  }
  // const mockappointments = [
  //   {
  //     visit_date: '2024-06-10T09:00:00Z',
  //     visit_status: 'Scheduled' as const,
  //     medical_staff: {
  //       users: {
  //         last_name: 'Johnson',
  //         first_name: 'Dr. Emily',
  //       },
  //     },
  //   },
  //   {
  //     visit_date: '2024-06-15T14:30:00Z',
  //     visit_status: 'Completed' as const,
  //     medical_staff: {
  //       users: {
  //         last_name: 'Williams',
  //         first_name: 'Dr. Michael',
  //       },
  //     },
  //   },
  //   {
  //     visit_date: '2024-06-20T11:00:00Z',
  //     visit_status: 'Canceled' as const,
  //     medical_staff: {
  //       users: {
  //         last_name: 'Brown',
  //         first_name: 'Dr. Sarah',
  //       },
  //     },
  //   }
  // ]
  const mockBilling = [
    {
      bill_id: 1001,
      total_price: 1250.0,
      status: 'Pending',
      created_at: '2024-06-01T10:00:00Z',
      updated_at: '2024-06-01T10:00:00Z',
      billing_items: [
        {
          item_id: 1,
          quantity: 1,
          item_type: 'Consultation',
          unit_price: 800.0,
          description: 'General physician consultation',
          item_id_ref: 201,
          total_price: 800.0,
        },
        {
          item_id: 2,
          quantity: 2,
          item_type: 'Lab Test',
          unit_price: 225.0,
          description: 'Blood test panel',
          item_id_ref: 305,
          total_price: 450.0,
        },
      ],
    },
    {
      bill_id: 1002,
      total_price: 3200.0,
      status: 'Paid',
      created_at: '2024-05-20T14:20:00Z',
      updated_at: '2024-05-22T09:15:00Z',
      billing_items: [
        {
          item_id: 3,
          quantity: 1,
          item_type: 'Imaging',
          unit_price: 3200.0,
          description: 'X-ray chest',
          item_id_ref: 410,
          total_price: 3200.0,
        },
      ],
    },
  ]

  const fetchData = useCallback(async () => {
    try {
      // const [patientResponse, appointmentsResponse, billingResponse] =
      //   await Promise.all([
      //     fetch('/api/patients/me'),
      //     fetch('/api/appointments'),
      //     fetch('/api/billing/patient/me'),
      //   ])

      // if (!patientResponse.ok) {
      //   throw new Error('Failed to fetch patient profile')
      // }
      // if (!appointmentsResponse.ok) {
      //   throw new Error('Failed to fetch appointments')
      // }

      const appointmentsResponse = await fetch(`/api/dbhandler?patient_id=${user.id}&model=appointment`);
      if (!appointmentsResponse.ok) {
        alert('Failed to fetch appointments');
        return; 
      }

      // const patientData = await patientResponse.json()
      const appointmentsData = await appointmentsResponse.json()
      // const billingData = await billingResponse.json()

      // setPatientProfile(patientData)
      setAppointments(appointmentsData)
      console.log('appointments for patient ID:', appointments);
      // setBilling(billingData)
    } catch (err) {
      // alert('An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  // if (loading) {
  //   return <SkeletonLoader />
  // }

  if (error) {
    return <ErrorPage error={new Error(error)} reset={fetchData} />
  }

  return (
    <div className="flex flex-col w-full gap-4 px-4 py-10 container mx-auto @container">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}{' '}
            {patientProfile?.users
              ? `${patientProfile.users.first_name} ${patientProfile.users.last_name}`
              : 'John Doe'}
          </h1>
        </div>
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 /lg:grid-cols-3 gap-4 md:px-20 max-w-6xl mx-auto">
        <div className='flex flex-col gap-3'>
          <PatientInfoCard
            patientProfile={mockpatientinfo}
            //patientProfile={patientProfile }
            refreshData={fetchData}
          />
          <AppointmentCalendarCard 
            //appointments={appointments} 
            appointments={appointments} 
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="hidden sm:grid gap-4 md:grid-cols-2 col-span-2">
            <SummaryStatsCard appointments={appointments} billing={mockBilling} />
          </section>
          {!loading && appointments.length > 0 && (
            <PatientAppointmentsTable appointments={appointments} />
          )}
          <BillingSummaryTable billing={billing} appointments={appointments} />
        </div>
      </section>
      <FormListTable />

      
    </div>
  )
}

























import { ColumnDef, SortingState, useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, getFilteredRowModel, ColumnFiltersState, VisibilityState, RowSelectionState, flexRender } from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'


type Form = {
  id: string
  title: string
  owner: { first_name: string; last_name: string } | null
  fields: Record<string, any>
  createdAt: string
}

const columns: ColumnDef<Form>[] = [
  { id: 'select', header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={value => row.toggleSelected(!!value)} aria-label="Select row" />, enableSorting: false, enableHiding: false },
  { accessorKey: 'title', header: 'Form Name' },
  { accessorKey: 'owner', header: 'Created By', cell: ({ row }) => `${row.original.owner?.first_name ?? ''} ${row.original.owner?.last_name ?? ''}` },
  { accessorKey: 'createdAt', header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Created <ArrowUpDown className="ml-2 h-4 w-4" /></Button>, cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
  { id: 'actions', enableHiding: false, cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
]

const FormListTable = () => {
  const [data, setData] = React.useState<Form[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [selectedForm, setSelectedForm] = React.useState<Form | null>(null)

  // fetch all forms on mount
  React.useEffect(() => {
    async function loadForms() {
      try {
        const res = await fetch('/api/dbhandler?model=form')
        const json = await res.json()
        setData(json)
      } catch {
        toast({ title: 'Failed to load forms' })
      }
    }
    loadForms()
  }, [])

  const table = useReactTable({
    data,
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
  })

  // when a row is selected, show the fill‑form UI
  React.useEffect(() => {
    const selectedIds = Object.keys(rowSelection)
    if (selectedIds.length === 1) {
      const form = data.find(f => f.id === selectedIds[0])
      setSelectedForm(form ?? null)
    } else {
      setSelectedForm(null)
    }
  }, [rowSelection, data])

  const handleSubmit = async (values: Record<string, any>) => {
    if (!selectedForm) return
    try {
      const res = await fetch(`/api/dbhandler?model=form&id=${selectedForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { ...selectedForm.fields, ...values } }),
      })
      if (res.ok) {
        toast({ title: 'Response saved!' })
        setRowSelection({})
        setSelectedForm(null)
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Save failed' })
      }
    } catch {
      toast({ title: 'Network error' })
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className='font-bold text-lg w-full /text-center'>Forms</div>
      {selectedForm ? (
        <div className="p-4 border rounded mb-4">
          <h3 className="font-bold mb-2">{selectedForm.title}</h3>
          <form onSubmit={e => { e.preventDefault(); handleSubmit({}) }} className="space-y-4">
            {Object.entries(selectedForm.fields).map(([key, val]) => (
              <div key={key}>
                <label className="block text-sm font-medium">{key}</label>
                <Input defaultValue={val as string} name={key} />
              </div>
            ))}
            <Button type="submit">Submit</Button>
            <Button variant="ghost" onClick={() => setRowSelection({})}>Cancel</Button>
          </form>
        </div>
      ) : null}

      <div className="flex items-center py-4">
        <Input placeholder="Filter forms..." value={(table.getColumn('title')?.getFilterValue() as string) ?? ''} onChange={event => table.getColumn('title')?.setFilterValue(event.target.value)} className="max-w-sm" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter(col => col.getCanHide()).map(col => (
              <DropdownMenuCheckboxItem key={col.id} checked={col.getIsVisible()} onCheckedChange={value => col.toggleVisibility(!!value)}>
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
                    {/* {header.isPlaceholder ? null : header.column.columnDef.header} */}
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} onClick={() => row.toggleSelected()}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {/* {cell.column.columnDef.cell ? cell.column.columnDef.cell({ ...cell.getContext(), row }) : null} */}
                    {cell.column.columnDef.cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null}
                  </TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No forms found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
    </div>
  )
}
