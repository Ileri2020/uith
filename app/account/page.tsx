'use client'

import React, { useEffect, useState } from 'react'
import { useAppContext } from '@/hooks/useAppContext'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { User, Mail, Phone, ShieldCheck, Stethoscope, Save, Loader2 } from 'lucide-react'

export default function AccountPage() {
  const { user, setUser } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    sub_profession: '',
    level: '',
    national_id: '',
    license_number: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        sub_profession: user.sub_profession || '',
        level: user.level || '',
        national_id: user.national_id || '',
        license_number: user.license_number || '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setLoading(true)
    try {
      const res = await fetch(`/api/dbhandler?model=user&id=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: user.id }),
      })

      if (res.ok) {
        const updatedUser = await res.json()
        setUser(updatedUser)
        toast.success('Account updated successfully!')
      } else {
        toast.error('Update failed')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="p-20 text-center text-slate-400">Please sign in to view account</div>

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 container mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your personal and professional profile details</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="h-24 bg-primary" />
            <CardContent className="pt-0 relative">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-200 -mt-12 overflow-hidden flex items-center justify-center">
                  {user.image ? <img src={user.image} className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-slate-400" />}
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="text-xl font-bold">{user.first_name} {user.last_name}</h3>
                <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                {user.isCertified && (
                  <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Certified Professional</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-600">Identity</span>
                {user.national_id ? <Badge className="bg-emerald-500">Verified</Badge> : <Badge variant="outline">Missing</Badge>}
              </div>
              {user.role !== 'patient' && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-600">License</span>
                  {user.isCertified ? <Badge className="bg-emerald-500">Certified</Badge> : <Badge variant="secondary">Pending Review</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Edit Profile
              </CardTitle>
              <CardDescription>Update your personal and professional information</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdate}>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input name="first_name" value={formData.first_name} onChange={handleChange} rounded-xl />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input name="last_name" value={formData.last_name} onChange={handleChange} rounded-xl />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input name="email" value={formData.email} disabled className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input name="phone_number" value={formData.phone_number} onChange={handleChange} />
                  </div>
                </div>

                {user.role !== 'patient' ? (
                  <div className="space-y-6 pt-6 border-t">
                    <h3 className="font-bold flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" /> Professional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Specialty / Sub-profession</Label>
                        <Input name="sub_profession" value={formData.sub_profession} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                          <SelectTrigger>
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
                      <div className="space-y-2 md:col-span-2">
                        <Label>Medical License Number</Label>
                        <Input name="license_number" value={formData.license_number} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-6 border-t">
                    <Label>National ID</Label>
                    <Input name="national_id" value={formData.national_id} onChange={handleChange} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-8 bg-slate-50 flex justify-end">
                <Button type="submit" className="h-12 px-8 font-bold flex items-center gap-2 shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
