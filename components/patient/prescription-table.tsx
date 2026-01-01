'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pill } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function PrescriptionTable({ patientId }: { patientId: string }) {
    const [prescriptions, setPrescriptions] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchPrescriptions() {
            try {
                const res = await fetch(`/api/dbhandler?model=prescription&patientId=${patientId}`)
                const data = await res.json()
                setPrescriptions(data)
            } catch (error) {
                console.error('Error fetching prescriptions:', error)
            } finally {
                setLoading(false)
            }
        }
        if (patientId) fetchPrescriptions()
    }, [patientId])

    const handleSendToPharmacist = async (pId: string) => {
        try {
            // For simplicity, we just change status to 'sent_to_pharmacist'
            // In a real app, you'd select a pharmacist
            const res = await fetch(`/api/dbhandler?model=prescription`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: pId,
                    status: 'sent_to_pharmacist'
                })
            })
            if (res.ok) {
                toast({ title: 'Prescription sent to pharmacy!' })
                // Refresh local state
                setPrescriptions(prescriptions.map(p => p.id === pId ? { ...p, status: 'sent_to_pharmacist' } : p))
            }
        } catch (error) {
            toast({ title: 'Error sending to pharmacist' })
        }
    }

    return (
        <Card className="shadow-lg border-none bg-white/50 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Prescriptions
                </CardTitle>
                <CardDescription>View and manage your drug prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Prescribed By</TableHead>
                                <TableHead>Drugs</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prescriptions.length > 0 ? prescriptions.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{format(new Date(p.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{p.creator?.first_name} {p.creator?.last_name}</TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            {Object.entries(p.drugs || {}).map(([name, dosage]) => (
                                                <div key={name}>{name}: {dosage as string}</div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={p.status === 'dispensed' ? 'default' : 'outline'}>
                                            {p.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                {p.status === 'pending' && (
                                                    <DropdownMenuItem onClick={() => handleSendToPharmacist(p.id)}>
                                                        Send to Pharmacist
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem>Download PDF</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No prescriptions found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
