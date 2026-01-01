'use client'

import React, { useState, useEffect, useCallback } from 'react'
import PatientInfoCard from '@/components/patient/patient-info-card'
import AppointmentCalendarCard from '@/components/patient/appointment-calendar-card'
import BillingSummaryTable from '@/components/patient/billing-summary-table'
import SummaryStatsCard from '@/components/patient/summary-stats-card'
import { Skeleton } from '@/components/ui/skeleton'
import { getGreeting } from '@/utils/greeting'
import ErrorPage from '@/app/error'
import { useAppContext } from '@/hooks/useAppContext'
import PatientAppointmentsTable from '@/components/patient/patient-appointments-table'
import BookAppointmentDialog from '@/components/patient/book-appointment-dialog'
import PrescriptionTable from '@/components/patient/prescription-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'

function SkeletonLoader() {
  return (
    <div className="flex flex-col w-full gap-4 px-4 py-10 container mx-auto @container text-center py-20">
      <h2 className="text-2xl font-bold animate-pulse">Loading Your Health Dashboard...</h2>
      <div className="flex flex-col w-full gap-4 mt-10">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [billing, setBilling] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAppContext()

  useEffect(() => {
    const trackVisit = async () => {
      const browserId = localStorage.getItem('browserId') || Math.random().toString(36).substring(7);
      localStorage.setItem('browserId', browserId);
      await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browserId })
      });
    };
    trackVisit();
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [apptRes, postsRes] = await Promise.all([
        fetch(`/api/dbhandler?patient_id=${user.id}&model=appointment`),
        fetch(`/api/dbhandler?model=post`)
      ]);

      if (apptRes.ok) {
        setAppointments(await apptRes.json());
      }
      if (postsRes.ok) {
        setPosts(await postsRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchData()
  }, [user?.id, fetchData])

  const announcements = posts.filter(p => p.type === 'announcement');
  const regularPosts = posts.filter(p => p.type === 'post');

  if (loading) {
    return <SkeletonLoader />
  }

  return (
    <div className="flex flex-col w-full gap-8 px-4 py-10 container mx-auto bg-slate-50/50 min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {getGreeting()}, {user?.first_name || 'Patient'}
          </h1>
          <p className="text-slate-500 mt-1">Welcome back to your health dashboard</p>
        </div>
        <BookAppointmentDialog refreshData={fetchData} />
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="space-y-8">
          <PatientInfoCard
            patientProfile={{
              blood_type: user?.blood_type || 'Unknown',
              emergency_contact_id: null,
              users: user
            }}
            refreshData={fetchData}
          />
          <SummaryStatsCard appointments={appointments} billing={[]} />
          <AppointmentCalendarCard appointments={appointments} />
        </div>

        <div className="xl:col-span-2 space-y-8">
          <PatientAppointmentsTable appointments={appointments} refreshData={fetchData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PrescriptionTable patientId={user?.id} />
            <FormListTable userId={user?.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-none bg-indigo-900 text-white">
          <CardHeader>
            <CardTitle>Hospital Announcements</CardTitle>
            <CardDescription className="text-indigo-200">Latest updates from medical staff</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {announcements.map((a, i) => (
                  <div key={i} className="p-4 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-indigo-500 text-white border-none uppercase text-[10px]">
                        {a.author?.role}
                      </Badge>
                      <span className="text-[10px] text-indigo-300">{format(new Date(a.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <h4 className="font-bold text-lg">{a.title}</h4>
                    <p className="text-sm text-indigo-100 mt-1">{a.description}</p>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-center text-indigo-300 py-10">No announcements found</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none bg-white">
          <CardHeader>
            <CardTitle>Health Feed</CardTitle>
            <CardDescription>Articles and tips from our professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-6">
                {regularPosts.map((p, i) => (
                  <div key={i} className="flex gap-4 items-start border-b pb-6 last:border-0">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={p.author?.avatarUrl} />
                      <AvatarFallback>{p.author?.first_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800">{p.title}</h4>
                        <span className="text-xs text-slate-400">{format(new Date(p.createdAt), 'MMM d')}</span>
                      </div>
                      <p className="text-xs font-semibold text-primary mb-2">By {p.author?.role} {p.author?.last_name}</p>
                      <p className="text-sm text-slate-600 line-clamp-3">{p.description}</p>
                    </div>
                  </div>
                ))}
                {regularPosts.length === 0 && <p className="text-center text-slate-400 py-10">No posts found</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FormListTable({ userId }: { userId: string }) {
  const [forms, setForms] = useState<any[]>([])

  useEffect(() => {
    async function loadForms() {
      if (!userId) return
      const res = await fetch(`/api/dbhandler?model=formField&recipientId=${userId}`)
      setForms(await res.json())
    }
    loadForms()
  }, [userId])

  return (
    <Card className="shadow-lg border-none bg-white/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle>My Forms</CardTitle>
        <CardDescription>Forms assigned to you by professionals</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60">
          <div className="space-y-3">
            {forms.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border group hover:border-primary transition-colors cursor-pointer">
                <div>
                  <p className="font-bold text-sm">{f.form?.title}</p>
                  <p className="text-[10px] text-muted-foreground italic">Assigned by: {f.appointment?.medical_staff?.first_name} {f.appointment?.medical_staff?.last_name}</p>
                </div>
                <Badge variant={f.status === 'filled' ? 'default' : 'destructive'} className="text-[10px]">
                  {f.status}
                </Badge>
              </div>
            ))}
            {forms.length === 0 && <p className="text-center text-xs text-muted-foreground py-10">No forms assigned yet</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
