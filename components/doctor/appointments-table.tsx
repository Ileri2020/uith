// @ts-nocheck
'use client'

import React, { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useAppContext } from "@/hooks/useAppContext"
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { AppointmentActionDialog } from "./appointment-action-dialog"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Appointment {
  id: string
  status: string
  visit_date: string
  reason: string
  patient: {
    first_name: string
    last_name: string
  }
}

export default function AppointmentsDataTable() {
  const [data, setData] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAppContext()
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [actionOpen, setActionOpen] = useState(false)

  const fetchAppointments = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/dbhandler?model=appointment&medical_staff_id=${user.id}&orderBy=createdAt&orderDir=desc`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Error fetching appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "patient",
      header: "Patient",
      cell: ({ row }) => `${row.original.patient?.first_name} ${row.original.patient?.last_name}`,
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      accessorKey: "visit_date",
      header: "Requested Date",
      cell: ({ row }) => format(new Date(row.original.visit_date), "MMM d, h:mm a"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const variant =
          status === 'completed' ? 'bg-green-600' :
            status === 'booked' ? 'bg-blue-600 animate-pulse' :
              status === 'unconfirmed_payment' ? 'bg-orange-500' :
                status === 'paid' ? 'bg-green-500' :
                  'bg-slate-500'

        return <Badge className={`${variant} capitalize text-white`}>{status.replace('_', ' ')}</Badge>
      },
    },
  ]

  const handleRowClick = (appt: Appointment) => {
    setSelectedAppointment(appt)
    setActionOpen(true)
  }

  if (loading && data.length === 0) return <div className="p-4 text-center animate-bounce">Loading appointments...</div>

  return (
    <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Appointment Requests</h2>
          <p className="text-xs text-slate-500">Click on a row to manage the appointment</p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchAppointments}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleRowClick}
        searchColumn="reason"
      />

      <AppointmentActionDialog
        open={actionOpen}
        onOpenChange={setActionOpen}
        appointment={selectedAppointment}
        refreshData={fetchAppointments}
      />
    </div>
  )
}

const DataTable = ({ columns, data, onRowClick, searchColumn }: any) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div>
      <div className="flex items-center justify-between py-2 mb-4">
        {searchColumn && (
          <Input
            placeholder="Search reason..."
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-xs bg-slate-50 border-none rounded-lg"
          />
        )}
      </div>

      <div className="rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold text-slate-500 uppercase">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-slate-50/50 transition-colors border-b border-slate-50"
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-sm py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">No appointments found.</TableCell>
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
    </div>
  )
}
