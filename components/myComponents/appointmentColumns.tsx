// appointmentColumns.tsx
'use client'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

type UserRef = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

export type FormFieldLite = {
  id: string
  label: string
  value?: string | null
  placeholder?: string | null
  required?: boolean
}

export type FormLite = {
  id: string
  title: string
  fields?: FormFieldLite[] | null
}

export type AppointmentLite = {
  id: string
  visit_date: string | Date
  visit_status: string
  patient?: UserRef | null
  medical_staff?: UserRef | null
  forms?: FormLite[] | null
  createdAt?: string | Date
}

export const appointmentColumns: ColumnDef<AppointmentLite>[] = [
  { id: 'select',
    header: () => null, // handled in the table component similarly to patient table (checkbox column)
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'visit_date',
    header: 'Visit Date',
    cell: ({ row }) => {
      const v = row.getValue('visit_date') as string | Date
      const d = typeof v === 'string' ? new Date(v) : v
      return format(new Date(d), 'yyyy-MM-dd HH:mm')
    }
  },
  {
    id: 'patient',
    header: 'Patient',
    accessorFn: row => row.patient ? `${row.patient.first_name ?? ''} ${row.patient.last_name ?? ''}`.trim() : '—',
    cell: ({ row }) => row.original.patient ? `${row.original.patient.first_name ?? ''} ${row.original.patient.last_name ?? ''}`.trim() : '—'
  },
  {
    id: 'staff',
    header: 'Staff',
    accessorFn: row => row.medical_staff ? `${row.medical_staff.first_name ?? ''} ${row.medical_staff.last_name ?? ''}`.trim() : '—',
    cell: ({ row }) => row.original.medical_staff ? `${row.original.medical_staff.first_name ?? ''} ${row.original.medical_staff.last_name ?? ''}`.trim() : '—'
  },
  {
    accessorKey: 'visit_status',
    header: 'Status'
  },
  {
    id: 'forms_count',
    header: 'Forms',
    accessorFn: row => (row.forms?.length ?? 0),
    cell: ({ row }) => String(row.original.forms?.length ?? 0)
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  }
]
