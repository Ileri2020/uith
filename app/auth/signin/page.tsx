'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { HeartPulse, Mail, Lock, LogIn } from 'lucide-react'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebook } from 'react-icons/fa'

export default function SigninPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSignin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (res?.ok) {
                toast.success('Signed in successfully!')
                router.push('/')
                router.refresh()
            } else {
                toast.error(res?.error || 'Invalid credentials')
            }
        } catch (error) {
            toast.error('Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md"
            >
                <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                    <CardHeader className="text-center space-y-1 py-8 bg-primary/5 border-b border-primary/10">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary rounded-2xl shadow-lg ring-4 ring-primary/20">
                                <HeartPulse className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">Sign In</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Access your medical portal and records</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSignin}>
                        <CardContent className="p-8 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address or Phone</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input name="email" placeholder="email or phone" className="pl-10 h-11 bg-white border-slate-200" required onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</Label>
                                    <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input name="password" type="password" placeholder="••••••••" className="pl-10 h-11 bg-white border-slate-200" required onChange={handleChange} />
                                </div>
                            </div>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/80 px-2 text-slate-400 font-bold">Or</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button type="button" variant="outline" className="h-11 rounded-2xl font-bold border-2" onClick={() => signIn('google')}>
                                    <FcGoogle className="h-5 w-5 mr-2" /> Google
                                </Button>
                                <Button type="button" variant="outline" className="h-11 rounded-2xl font-bold border-2" onClick={() => signIn('facebook')}>
                                    <FaFacebook className="h-5 w-5 mr-2 text-blue-600" /> Facebook
                                </Button>
                            </div>
                        </CardContent>

                        <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                            <Button
                                className="h-12 w-full rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : (
                                    <>
                                        <LogIn className="h-5 w-5" /> Sign In
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-sm text-slate-500">
                                New here? <Link href="/auth/signup" className="text-primary font-bold hover:underline underline-offset-4">Create Account</Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    )
}
