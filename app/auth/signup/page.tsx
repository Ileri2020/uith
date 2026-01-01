'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { HeartPulse, User, Mail, Lock, Phone, CreditCard, ShieldCheck, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebook } from 'react-icons/fa'
import { signIn } from 'next-auth/react'

export default function SignupPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
        role: 'patient',
        gender: 'other',
        national_id: '',
        license_number: '',
        sub_profession: '',
        level: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRoleChange = (val: string) => {
        setFormData({ ...formData, role: val })
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                toast.success('Account created successfully! Redirecting...')
                setTimeout(() => router.push('/auth/signin'), 1500)
            } else {
                const err = await res.json()
                toast.error(err.message || 'Signup failed')
            }
        } catch (error) {
            toast.error('Network error during signup')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-xl"
            >
                <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                    <CardHeader className="text-center space-y-1 py-8 bg-primary/5 border-b border-primary/10">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary rounded-2xl shadow-lg ring-4 ring-primary/20">
                                <HeartPulse className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">Join our Medical Network</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Step {step} of 2: {step === 1 ? 'Core Details' : 'Professional Profile'}</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSignup}>
                        <CardContent className="p-8 space-y-6">
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input name="first_name" placeholder="John" className="pl-10 h-11 bg-white" required onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</Label>
                                            <Input name="last_name" placeholder="Doe" className="h-11 bg-white" required onChange={handleChange} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input name="email" type="email" placeholder="john@example.com" className="pl-10 h-11 bg-white" required onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input name="phone_number" placeholder="08012345678" className="pl-10 h-11 bg-white" required onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input name="password" type="password" placeholder="••••••••" className="pl-10 h-11 bg-white" required onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">I am a...</Label>
                                            <Select onValueChange={handleRoleChange} defaultValue="patient">
                                                <SelectTrigger className="h-11 bg-white">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="patient">Patient seeking care</SelectItem>
                                                    <SelectItem value="doctor">Medical Doctor</SelectItem>
                                                    <SelectItem value="nurse">Professional Nurse</SelectItem>
                                                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        {formData.role === 'patient' ? (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
                                                    <ShieldCheck className="h-10 w-10 text-primary" />
                                                    <div>
                                                        <p className="font-bold text-slate-900">Identity Verification</p>
                                                        <p className="text-sm text-slate-500">We require a valid national ID for patient records.</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">National ID / Passport Number</Label>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                        <Input name="national_id" placeholder="ID Number" className="pl-10 h-11 bg-white" onChange={handleChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4">
                                                    <Stethoscope className="h-10 w-10 text-primary" />
                                                    <div>
                                                        <p className="font-bold text-slate-900">Professional Verification</p>
                                                        <p className="text-sm text-slate-500">Our medical board will review your credentials before certification.</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">License Number</Label>
                                                        <Input name="license_number" placeholder="MLN-000-000" className="h-11 bg-white" required onChange={handleChange} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Specialty</Label>
                                                        <Input name="sub_profession" placeholder="e.g. Cardiology" className="h-11 bg-white" required onChange={handleChange} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic / Professional Level</Label>
                                                        <Select onValueChange={(val) => setFormData({ ...formData, level: val })}>
                                                            <SelectTrigger className="h-11 bg-white">
                                                                <SelectValue placeholder="Select Level" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Consultant">Consultant</SelectItem>
                                                                <SelectItem value="Registrar">Registrar</SelectItem>
                                                                <SelectItem value="Senior Registrar">Senior Registrar</SelectItem>
                                                                <SelectItem value="Professor">Professor</SelectItem>
                                                                <SelectItem value="Matron/Nursing Officer">Matron/Nursing Officer</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>

                        <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                            <div className="flex gap-4 w-full">
                                {step === 2 && (
                                    <Button type="button" variant="outline" className="h-12 border-2 rounded-2xl font-bold flex-1" onClick={() => setStep(1)}>
                                        Back
                                    </Button>
                                )}
                                <Button
                                    type={step === 1 ? 'button' : 'submit'}
                                    className="h-12 rounded-2xl font-bold flex-[2] shadow-lg shadow-primary/20"
                                    disabled={loading}
                                    onClick={() => { if (step === 1) setStep(2) }}
                                >
                                    {loading ? 'Creating...' : step === 1 ? 'Continue' : 'Create Account'}
                                </Button>
                            </div>

                            {step === 1 && (
                                <>
                                    <div className="relative w-full py-4">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/80 px-2 text-slate-400 font-bold">Or continue with</span></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <Button type="button" variant="outline" className="h-12 rounded-2xl font-bold border-2" onClick={() => signIn('google')}>
                                            <FcGoogle className="h-5 w-5 mr-2" /> Google
                                        </Button>
                                        <Button type="button" variant="outline" className="h-12 rounded-2xl font-bold border-2" onClick={() => signIn('facebook')}>
                                            <FaFacebook className="h-5 w-5 mr-2 text-blue-600" /> Facebook
                                        </Button>
                                    </div>
                                    <p className="text-center text-sm text-slate-500 mt-4">
                                        Already have an account? <Link href="/auth/signin" className="text-primary font-bold hover:underline underline-offset-4">Sign In</Link>
                                    </p>
                                </>
                            )}
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}
