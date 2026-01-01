'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, ShieldCheck, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function CertificationTable() {
    const [professionals, setProfessionals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchProfessionals = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/dbhandler?model=user')
            const data = await res.json()
            // Filter for non-patients who aren't certified yet or just list all professionals
            const pros = data.filter((u: any) => u.role !== 'patient')
            setProfessionals(pros)
        } catch (e) {
            toast.error('Failed to load professionals')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfessionals()
    }, [])

    const handleCertify = async (userId: string, status: boolean) => {
        try {
            const res = await fetch(`/api/dbhandler?model=user&id=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, isCertified: status })
            })
            if (res.ok) {
                toast.success(status ? 'Professional certified!' : 'Certification revoked')
                setProfessionals(professionals.map(p => p.id === userId ? { ...p, isCertified: status } : p))
            }
        } catch (error) {
            toast.error('Operation failed')
        }
    }

    return (
        <Card className="shadow-xl border-none">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Professional Certification</CardTitle>
                        <CardDescription>Verify and certify medical personnel licenses</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Specialty</TableHead>
                                <TableHead>License No.</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-10">Loading professionals...</TableCell></TableRow>
                            ) : professionals.length > 0 ? professionals.map((p) => (
                                <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-bold">{p.first_name} {p.last_name}</TableCell>
                                    <TableCell className="capitalize"><Badge variant="outline">{p.role}</Badge></TableCell>
                                    <TableCell className="text-sm font-medium">{p.sub_profession || 'N/A'}</TableCell>
                                    <TableCell className="font-mono text-xs">{p.license_number || 'PENDING'}</TableCell>
                                    <TableCell>
                                        {p.isCertified ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold">
                                                <UserCheck className="h-3 w-3 mr-1" /> Certified
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none">
                                                Unverified
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.isCertified ? (
                                            <Button size="sm" variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleCertify(p.id, false)}>
                                                Revoke
                                            </Button>
                                        ) : (
                                            <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-sm" onClick={() => handleCertify(p.id, true)}>
                                                Certify
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-400 font-medium">No professional accounts found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
