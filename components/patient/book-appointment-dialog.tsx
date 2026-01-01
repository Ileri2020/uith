'use client'

import * as React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, Search, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAppContext } from '@/hooks/useAppContext'

export default function BookAppointmentDialog({ refreshData }: { refreshData: () => void }) {
    const { user } = useAppContext()
    const [open, setOpen] = React.useState(false)
    const [profession, setProfession] = React.useState<string>('doctor')
    const [professionals, setProfessionals] = React.useState<any[]>([])
    const [searchQuery, setSearchQuery] = React.useState('')
    const [selectedProfessional, setSelectedProfessional] = React.useState<any>(null)
    const [reason, setReason] = React.useState('')
    const [description, setDescription] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    // Fetch professionals based on selected profession
    React.useEffect(() => {
        async function fetchProfessionals() {
            try {
                const res = await fetch(`/api/dbhandler?model=user&role=${profession}`)
                const data = await res.json()
                setProfessionals(data)
            } catch (error) {
                console.error('Error fetching professionals:', error)
            }
        }
        if (open) fetchProfessionals()
    }, [profession, open])

    const filteredProfessionals = professionals.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const [phone, setPhone] = React.useState(user?.phone_number || '')
    const [address, setAddress] = React.useState(user?.address || '')

    const handleBook = async () => {
        if (!selectedProfessional || !reason || !description) {
            toast({ title: 'Please fill all fields', variant: 'destructive' })
            return
        }

        if (!phone || !address) {
            toast({ title: 'Contact info required', description: 'Please provide your phone number and address.', variant: 'destructive' })
            return
        }

        setLoading(true)
        try {
            // Update user contact info if it was missing or changed
            if (phone !== user.phone_number || address !== user.address) {
                await fetch(`/api/dbhandler?model=user&id=${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id, phone_number: phone, address: address })
                })
            }

            const res = await fetch('/api/dbhandler?model=appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: user.id,
                    medical_staff_id: selectedProfessional.id,
                    profession: profession,
                    reason: reason,
                    reason_description: description,
                    visit_date: new Date(),
                    status: 'booked',
                }),
            })

            if (res.ok) {
                toast({ title: 'Appointment booked successfully!' })
                setOpen(false)
                refreshData()
                setSelectedProfessional(null)
                setReason('')
                setDescription('')
            } else {
                toast({ title: 'Failed to book appointment', variant: 'destructive' })
            }
        } catch (error) {
            toast({ title: 'Network error', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Book Appointment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Book a New Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Profession</Label>
                        <Select value={profession} onValueChange={setProfession}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Profession" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="nurse">Nurse</SelectItem>
                                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Search Professional Name</Label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2 text-sm">
                        {filteredProfessionals.length > 0 ? (
                            filteredProfessionals.map((p) => (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedProfessional?.id === p.id ? 'bg-primary/10 border-primary' : ''
                                        }`}
                                    onClick={() => setSelectedProfessional(p)}
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {p.first_name} {p.last_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {p.sub_profession} • {p.level}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-yellow-500">
                                            <Star className="h-3 w-3 fill-current" />
                                            <span>{p.rating?.toFixed(1) || '5.0'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary">${p.appointment_price || '0'}</p>
                                        {selectedProfessional?.id === p.id && (
                                            <span className="text-[10px] text-primary uppercase font-bold">Selected</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No professionals found</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Reason for Appointment</Label>
                        <Input
                            placeholder="e.g. Fever, Checkup..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            placeholder="Tell us more..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Phone Number</Label>
                            <Input
                                placeholder="080..."
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Address</Label>
                            <Input
                                placeholder="Delivery/Contact Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleBook} disabled={loading}>
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
