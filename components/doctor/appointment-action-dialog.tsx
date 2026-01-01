'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, CheckCircle, XCircle, Pill, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAppContext } from '@/hooks/useAppContext'

export function AppointmentActionDialog({ open, onOpenChange, appointment, refreshData }: any) {
    const { user } = useAppContext()
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [profMessage, setProfMessage] = useState('')
    const [availableForms, setAvailableForms] = useState<any[]>([])
    const [selectedFormId, setSelectedFormId] = useState<string>('')

    // Prescription state
    const [isPrescribing, setIsPrescribing] = useState(false)
    const [prescriptionDrugs, setPrescriptionDrugs] = useState<Record<string, string>>({ '': '' })

    useEffect(() => {
        if (open && appointment) {
            setProfMessage(appointment.professional_message || '')
            loadMessages()
            loadForms()
        }
    }, [open, appointment])

    const loadMessages = async () => {
        if (!appointment?.conversation?.id) return
        const res = await fetch(`/api/dbhandler?model=message&conversationId=${appointment.conversation.id}`)
        setMessages(await res.json())
    }

    const loadForms = async () => {
        const res = await fetch(`/api/dbhandler?model=form&ownerId=${user.id}`)
        setAvailableForms(await res.json())
    }

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/dbhandler?model=appointment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: appointment.id,
                    status: newStatus,
                    professional_message: profMessage,
                    form_id: selectedFormId || appointment.form_id
                })
            })
            if (res.ok) {
                toast({ title: `Appointment ${newStatus}!` })
                refreshData()
                onOpenChange(false)
            }
        } catch (error) {
            toast({ title: 'Error updating appointment' })
        }
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !appointment.conversation?.id) return
        try {
            const res = await fetch('/api/dbhandler?model=message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newMessage,
                    senderId: user.id,
                    receiverId: appointment.patient_id,
                    conversationId: appointment.conversation.id
                })
            })
            if (res.ok) {
                setMessages([...messages, await res.json()])
                setNewMessage('')
            }
        } catch (error) { }
    }

    const handleCreatePrescription = async () => {
        const cleanDrugs: any = {}
        Object.entries(prescriptionDrugs).forEach(([k, v]) => {
            if (k.trim()) cleanDrugs[k] = v
        })
        if (Object.keys(cleanDrugs).length === 0) return

        try {
            const res = await fetch('/api/dbhandler?model=prescription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId: appointment.id,
                    patientId: appointment.patient_id,
                    creatorId: user.id,
                    drugs: cleanDrugs,
                    status: 'pending'
                })
            })
            if (res.ok) {
                toast({ title: 'Prescription created!' })
                setIsPrescribing(false)
                setPrescriptionDrugs({ '': '' })
            }
        } catch (error) { }
    }

    if (!appointment) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden bg-white shadow-2xl border-none">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex justify-between items-center text-2xl font-bold">
                        <span>Appointment with {appointment.patient?.first_name} {appointment.patient?.last_name}</span>
                        <Badge className="capitalize bg-primary/10 text-primary border-primary/20">{appointment.status}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                        {/* Left: Info & Chat */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">Request Details</h4>
                                <p className="font-bold text-lg text-slate-900">{appointment.reason}</p>
                                <p className="text-sm text-slate-600 mt-1">{appointment.reason_description}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-3 italic">Visit Date: {new Date(appointment.visit_date).toLocaleString()}</p>
                            </div>

                            <div className="border rounded-xl p-4 flex flex-col h-[350px] bg-white shadow-sm">
                                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                    <Send className="h-4 w-4 text-primary" /> Conversation
                                </h4>
                                <ScrollArea className="flex-1 mb-4 pr-2">
                                    <div className="space-y-3">
                                        {messages.map((m, i) => (
                                            <div key={i} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.senderId === user.id ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                                    {m.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="flex gap-2 bg-slate-50 p-2 rounded-lg border">
                                    <Input
                                        className="border-none bg-transparent focus-visible:ring-0 shadow-none"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button size="icon" onClick={handleSendMessage} className="rounded-full shadow-md"><Send className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="space-y-6">
                            {appointment.status === 'booked' && (
                                <div className="p-5 border-2 border-primary/20 bg-primary/5 rounded-2xl space-y-4">
                                    <h4 className="font-bold text-primary flex items-center gap-2 underline decoration-primary/30">Action Required</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs font-bold text-slate-500">MESSAGE TO PATIENT</Label>
                                            <Textarea
                                                placeholder="e.g. Come to Room 4, please fill this form..."
                                                className="mt-1 bg-white"
                                                value={profMessage}
                                                onChange={e => setProfMessage(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-slate-500">ATTACH FORM (OPTIONAL)</Label>
                                            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                                                <SelectTrigger className="bg-white mt-1">
                                                    <SelectValue placeholder="Select a form..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableForms.map(f => <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button className="flex-1 bg-green-600 hover:bg-green-700 shadow-md" onClick={() => handleUpdateStatus('accepted')}>
                                                <CheckCircle className="h-4 w-4 mr-2" /> Accept
                                            </Button>
                                            <Button variant="destructive" className="flex-1 shadow-md" onClick={() => handleUpdateStatus('rejected')}>
                                                <XCircle className="h-4 w-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {appointment.status === 'unconfirmed_payment' && (
                                <div className="p-5 border-2 border-orange-200 bg-orange-50 rounded-2xl space-y-4">
                                    <h4 className="font-bold text-orange-700">Confirm Payment</h4>
                                    <p className="text-sm">Patient says they paid under name: <span className="font-bold underline">{appointment.payment_transfer_name}</span></p>
                                    <Button className="w-full bg-orange-500 hover:bg-orange-600 shadow-md text-white" onClick={() => handleUpdateStatus('paid')}>
                                        Confirm Payment Received
                                    </Button>
                                </div>
                            )}

                            {/* Prescriptions */}
                            <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-4">
                                <h4 className="font-bold flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /> Prescribe Drugs</h4>
                                {!isPrescribing ? (
                                    <Button variant="outline" className="w-full border-dashed" onClick={() => setIsPrescribing(true)}>
                                        <Plus className="h-4 w-4 mr-2" /> New Prescription
                                    </Button>
                                ) : (
                                    <div className="space-y-3 bg-slate-50 p-3 rounded-lg">
                                        {Object.keys(prescriptionDrugs).map((drug, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    placeholder="Drug name"
                                                    className="bg-white"
                                                    value={drug}
                                                    onChange={e => {
                                                        const newDrugs = { ...prescriptionDrugs }
                                                        const val = newDrugs[drug]
                                                        delete newDrugs[drug]
                                                        newDrugs[e.target.value] = val
                                                        setPrescriptionDrugs(newDrugs)
                                                    }}
                                                />
                                                <Input
                                                    placeholder="Dosage"
                                                    className="bg-white"
                                                    value={prescriptionDrugs[drug]}
                                                    onChange={e => setPrescriptionDrugs({ ...prescriptionDrugs, [drug]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" onClick={() => setPrescriptionDrugs({ ...prescriptionDrugs, '': '' })}>+ Add More</Button>
                                        <div className="flex gap-2 pt-2">
                                            <Button className="flex-1" size="sm" onClick={handleCreatePrescription}>Save Prescription</Button>
                                            <Button variant="ghost" size="sm" onClick={() => setIsPrescribing(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Complete Button */}
                            {appointment.status === 'paid' && (
                                <Button className="w-full h-12 text-lg font-bold shadow-lg" onClick={() => handleUpdateStatus('completed')}>
                                    Mark as Completed
                                </Button>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="bg-slate-50 p-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Minimize</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
