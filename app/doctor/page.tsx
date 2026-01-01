// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import AppointmentsTable from '@/components/doctor/appointments-table'
import MedicineStockTable from '@/components/doctor/medicine-stock-table'
import RoomAvailabilityTable from '@/components/doctor/free-rooms'
import DoctorInfoCard from '@/components/doctor/doctor-info'
import { getGreeting } from '@/utils/greeting'
import { useAppContext } from '@/hooks/useAppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Plus, ClipboardList, TrendingUp, Users, Calendar as CalendarIcon, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import MyFormsDataTable from '@/components/doctor/doctorsforms'
import AnnouncementCreator from '@/components/doctor/announcement-creator'

export default function DoctorDashboard() {
  const { user } = useAppContext()
  const [stats, setStats] = useState({ patients: 0, appointments: 0, revenue: 0 })

  useEffect(() => {
    // Some mock stats or fetch from DB
    setStats({ patients: 124, appointments: 12, revenue: 1540 })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 container mx-auto">
      {/* Header */}
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, Dr. {user?.last_name || 'Professional'}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-slate-500 font-medium">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider">
              {user?.level || 'Consultant'} • {user?.sub_profession || 'Medical Specialist'}
            </span>
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <Star className="h-4 w-4 fill-current" />
              <span>{user?.rating?.toFixed(1) || '5.0'} ({user?.total_ratings || 0} reviews)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <CreateFormDialog />
        </div>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Today's Appointments" value={stats.appointments} sub="4 completed" icon={<CalendarIcon className="h-6 w-6" />} color="bg-blue-500" />
        <StatsCard title="Total Patients" value={stats.patients} sub="+12 this month" icon={<Users className="h-6 w-6" />} color="bg-indigo-500" />
        <StatsCard title="Monthly Revenue" value={`$${stats.revenue}`} sub="Next payment in 3 days" icon={<TrendingUp className="h-6 w-6" />} color="bg-emerald-500" />
        <StatsCard title="Pending Forms" value="8" sub="Action required" icon={<ClipboardList className="h-6 w-6" />} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content: Appointments */}
        <div className="xl:col-span-2 space-y-8">
          <AppointmentsTable />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MedicineStockTable />
            <RoomAvailabilityTable />
          </div>
        </div>

        {/* Right Sidebar: Profile, Forms, Posts */}
        <div className="space-y-8">
          <AnnouncementCreator />
          <MyFormsDataTable />
          <DoctorInfoCard />
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, sub, icon, color }: any) {
  return (
    <Card className="border-none shadow-lg overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{value}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>
          </div>
          <div className={`${color} p-4 rounded-2xl text-white shadow-inner group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateFormDialog() {
  const { user } = useAppContext()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([{ text: '', type: 'string' }])
  const [open, setOpen] = useState(false)

  const handleCreate = async () => {
    if (!title) return
    const fields: any = {}
    questions.forEach(q => { if (q.text) fields[q.text] = q.type })

    try {
      const res = await fetch('/api/dbhandler?model=form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ownerId: user.id, fields })
      })
      if (res.ok) {
        toast({ title: 'New form created!' })
        setOpen(false)
        setTitle('')
        setQuestions([{ text: '', type: 'string' }])
      }
    } catch (e) { }
  }

  return (
    <div className="relative">
      <Button onClick={() => setOpen(!open)} className="h-12 px-6 rounded-full font-bold shadow-lg flex items-center gap-2">
        <Plus className="h-5 w-5" /> New Form
      </Button>
      {open && (
        <Card className="absolute top-14 right-0 w-[350px] z-50 shadow-2xl border-none p-6 space-y-4">
          <h3 className="font-bold text-lg">Create Question Form</h3>
          <Input placeholder="Form Title" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="max-h-60 overflow-y-auto space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Question ${i + 1}`}
                  value={q.text}
                  onChange={e => {
                    const n = [...questions]; n[i].text = e.target.value; setQuestions(n)
                  }}
                />
                <select className="text-xs border rounded p-1" value={q.type} onChange={e => {
                  const n = [...questions]; n[i].type = e.target.value; setQuestions(n)
                }}>
                  <option value="string">Text</option>
                  <option value="number">Num</option>
                  <option value="boolean">Bool</option>
                </select>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => setQuestions([...questions, { text: '', type: 'string' }])}>+ Add Question</Button>
          <Button className="w-full" onClick={handleCreate}>Save Form Templates</Button>
        </Card>
      )}
    </div>
  )
}
