'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pill, CheckCircle2, RotateCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function PrescriptionDispenser() {
    const [prescriptions, setPrescriptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPrescriptions = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/dbhandler?model=prescription&status=sent_to_pharmacist')
            setPrescriptions(await res.json())
        } catch (e) { } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPrescriptions()
    }, [])

    const handleDispense = async (pId: string) => {
        try {
            const res = await fetch(`/api/dbhandler?model=prescription`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pId, status: 'dispensed' })
            })
            if (res.ok) {
                toast({ title: 'Prescription marked as dispensed!' })
                setPrescriptions(prescriptions.filter(p => p.id !== pId))
            }
        } catch (error) { }
    }

    return (
        <Card className="shadow-xl border-none">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Pill className="h-6 w-6 text-primary" /> Pending Prescriptions
                    </CardTitle>
                    <CardDescription>Prescriptions sent by doctors for dispensing</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchPrescriptions}><RotateCw className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Prescribed By</TableHead>
                                <TableHead>Drugs & Dosage</TableHead>
                                <TableHead>Requested At</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prescriptions.length > 0 ? prescriptions.map((p) => (
                                <TableRow key={p.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-bold">{p.patient?.first_name} {p.patient?.last_name}</TableCell>
                                    <TableCell className="text-sm font-medium text-slate-500">Dr. {p.creator?.last_name}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {Object.entries(p.drugs || {}).map(([name, dosage]) => (
                                                <Badge key={name} variant="outline" className="mr-1 text-[10px] bg-slate-50">
                                                    {name}: {dosage as string}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400 font-medium">
                                        {format(new Date(p.createdAt), 'MMM d, h:mm a')}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-sm" onClick={() => handleDispense(p.id)}>
                                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Dispensed
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center py-20">
                                        <div className="flex flex-col items-center opacity-40">
                                            <CheckCircle2 className="h-12 w-12 mb-2" />
                                            <p className="font-bold">All prescriptions dispensed!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
