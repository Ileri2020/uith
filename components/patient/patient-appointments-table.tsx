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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Send, RefreshCw, Star } from 'lucide-react'
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
import { ScrollArea } from '@/components/ui/scroll-area'

type Appointment = {
  id: string
  visit_date: string
  status: string
  medical_staff: any
  profession: string
  reason: string
  reason_description: string
  professional_message?: string
  payment_transfer_name?: string
  patient_rating?: number
  conversation?: any
  form?: any
}

export default function PatientAppointmentsTable({
  appointments,
  refreshData
}: {
  appointments: any[],
  refreshData: () => void
}) {
  const { user } = useAppContext()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)

  // Chat state
  const [messages, setMessages] = React.useState<any[]>([])
  const [newMessage, setNewMessage] = React.useState('')
  const [paymentName, setPaymentName] = React.useState('')
  const [formResponses, setFormResponses] = React.useState<Record<string, any>>({})
  const [rating, setRating] = React.useState(0)

  // Filter appointments for the current patient
  const patientAppointments = React.useMemo(
    () => appointments.filter(appt => appt.patient_id == user?.id),
    [appointments, user?.id],
  )

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'visit_date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.visit_date),
    },
    {
      accessorKey: 'medical_staff',
      header: 'Professional',
      cell: ({ row }) => {
        const staff = row.original.medical_staff
        return `${staff?.first_name} ${staff?.last_name} (${row.original.profession})`
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusVariant(row.original.status)}>{row.original.status.replace('_', ' ')}</Badge>
      ),
    },
    {
      accessorKey: 'payment',
      header: 'Payment',
      cell: ({ row }) => (
        <span className="text-xs font-semibold">
          {row.original.payment_transfer_name ? 'Unconfirmed' : 'Pending'}
        </span>
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
            <DropdownMenuItem onClick={() => handleView(row.original)}>Interact / View</DropdownMenuItem>
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600'
      case 'accepted': return 'bg-blue-600'
      case 'rejected': return 'bg-red-600'
      case 'unconfirmed_payment': return 'bg-orange-500'
      case 'paid': return 'bg-green-500'
      case 'pending': return 'bg-yellow-600'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'MMM d, h:mm a')
  }

  const handleView = async (appt: Appointment) => {
    setSelectedAppointment(appt)
    setDialogOpen(true)
    setPaymentName(appt.payment_transfer_name || '')

    // Load chat messages
    if (appt.conversation?.id) {
      const res = await fetch(`/api/dbhandler?model=message&conversationId=${appt.conversation.id}`)
      const data = await res.json()
      setMessages(data)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAppointment?.conversation?.id) return

    try {
      const res = await fetch('/api/dbhandler?model=message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newMessage,
          senderId: user.id,
          receiverId: selectedAppointment.medical_staff_id,
          conversationId: selectedAppointment.conversation.id
        })
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages([...messages, msg])
        setNewMessage('')
      }
    } catch (error) {
      toast({ title: 'Failed to send message' })
    }
  }

  const handlePaymentSubmit = async () => {
    if (!paymentName) return
    try {
      const res = await fetch(`/api/dbhandler?model=appointment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppointment.id,
          payment_transfer_name: paymentName,
          status: 'unconfirmed_payment'
        })
      })
      if (res.ok) {
        toast({ title: 'Payment details submitted!' })
        refreshData()
        setDialogOpen(false)
      }
    } catch (error) {
      toast({ title: 'Error submitting payment' })
    }
  }

  const handleFormSubmit = async () => {
    if (!selectedAppointment?.form) return
    try {
      const res = await fetch('/api/dbhandler?model=formField', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedAppointment.form.title,
          recipientId: user.id,
          formId: selectedAppointment.form.id,
          appointmentId: selectedAppointment.id,
          answers: formResponses,
          status: 'filled'
        })
      })
      if (res.ok) {
        toast({ title: 'Form submitted!' })
      }
    } catch (error) {
      toast({ title: 'Error submitting form' })
    }
  }

  const handleRate = async () => {
    if (rating === 0) return
    try {
      await fetch('/api/dbhandler?model=appointment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppointment.id,
          patient_rating: rating
        })
      })
      toast({ title: 'Thank you for your rating!' })
      setDialogOpen(false)
      refreshData()
    } catch (error) { }
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Appointment with Dr. {selectedAppointment?.medical_staff?.first_name} {selectedAppointment?.medical_staff?.last_name}</span>
              <Badge className={getStatusVariant(selectedAppointment?.status || '')}>{selectedAppointment?.status}</Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Summary Section */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-bold">Reason: {selectedAppointment?.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedAppointment?.reason_description}</p>
                {selectedAppointment?.professional_message && (
                  <div className="mt-4 p-3 bg-primary/10 border-l-4 border-primary rounded text-sm italic">
                    <p className="font-bold text-xs uppercase not-italic">Message from Professional:</p>
                    {selectedAppointment.professional_message}
                  </div>
                )}
              </div>

              {/* Chat Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm">Conversation</h4>
                <div className="border rounded-lg p-4 h-60 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 mb-4">
                    <div className="space-y-2">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.senderId === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {selectedAppointment?.status !== 'completed' && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button size="icon" onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Section */}
              {selectedAppointment?.status === 'accepted' && (
                <div className="p-4 border border-dashed rounded-lg space-y-3">
                  <h4 className="font-bold text-sm">Payment Required: ${selectedAppointment.medical_staff.appointment_price}</h4>
                  <p className="text-xs text-muted-foreground">Please pay via bank transfer to ACC: 123456789 (HealthBank) and input your name below.</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter payment name..."
                      value={paymentName}
                      onChange={e => setPaymentName(e.target.value)}
                    />
                    <Button onClick={handlePaymentSubmit}>Submit & Pay</Button>
                  </div>
                </div>
              )}

              {/* Form Section */}
              {selectedAppointment?.form && selectedAppointment?.status === 'unconfirmed_payment' || selectedAppointment?.status === 'paid' && (
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-bold text-sm">Required Form: {selectedAppointment.form.title}</h4>
                  <div className="space-y-3">
                    {Object.keys(selectedAppointment.form.fields || {}).map(f => (
                      <div key={f}>
                        <Label className="text-xs">{f}</Label>
                        <Input
                          placeholder={f}
                          onChange={e => setFormResponses({ ...formResponses, [f]: e.target.value })}
                        />
                      </div>
                    ))}
                    <Button className="w-full" onClick={handleFormSubmit}>Submit Filled Form</Button>
                  </div>
                </div>
              )}

              {/* Final Rating Section */}
              {selectedAppointment?.status === 'completed' && !selectedAppointment.patient_rating && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center space-y-3">
                  <p className="text-sm font-bold">Rate this appointment</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`h-6 w-6 cursor-pointer ${rating >= s ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                        onClick={() => setRating(s)}
                      />
                    ))}
                  </div>
                  <Button size="sm" onClick={handleRate}>Submit Rating</Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Card className="sm:col-span-2 order-1 lg:order-none shadow-xl border-none bg-white/50 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold">My Appointments</CardTitle>
            <CardDescription>Track and manage your healthcare visits</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={refreshData}><RefreshCw className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="px-0">
          <div className="flex items-center py-4 px-4 gap-2">
            <Input
              placeholder="Filter reason..."
              value={(table.getColumn('reason')?.getFilterValue() as string) ?? ''}
              onChange={event => table.getColumn('reason')?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border mx-4 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
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
                {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">No appointments found.</TableCell>
                  </TableRow>
                )}
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
