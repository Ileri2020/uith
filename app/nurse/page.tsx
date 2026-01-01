// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { PatientDetailsDialog } from '@/components/nurse/patient-details-dialog'
import { useAppContext } from '@/hooks/useAppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AppointmentsTable from '@/components/doctor/appointments-table'
import { getGreeting } from '@/utils/greeting'
import { Star, Heart, Activity, Users, PlusCircle } from 'lucide-react'
import AnnouncementCreator from '@/components/doctor/announcement-creator'

export default function NurseDashboard() {
  const { user } = useAppContext()
  const [stats, setStats] = useState({ activePatients: 4, vitalsPending: 2 })

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8 container mx-auto">
      {/* Header */}
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, Nurse {user?.last_name || 'Professional'}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-slate-500 font-medium">
            <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider">
              {user?.level || 'Head Nurse'} • {user?.sub_profession || 'Critical Care'}
            </span>
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <Star className="h-4 w-4 fill-current" />
              <span>{user?.rating?.toFixed(1) || '5.0'}</span>
            </div>
          </div>
        </div>
        <Button className="h-12 px-6 rounded-full font-bold shadow-lg flex items-center gap-2 bg-rose-600 hover:bg-rose-700">
          <PlusCircle className="h-5 w-5" /> Admit Patient
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Assigned Patients" value={stats.activePatients} icon={<Users className="h-6 w-6" />} color="bg-rose-500" />
        <StatsCard title="Vitals Pending" value={stats.vitalsPending} icon={<Activity className="h-6 w-6" />} color="bg-orange-500" />
        <StatsCard title="Room Assignments" value="12" icon={<Heart className="h-6 w-6" />} color="bg-blue-500" />
        <StatsCard title="Shift Hours" value="8/12" icon={<Activity className="h-6 w-6" />} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <AppointmentsTable />
        </div>

        <div className="space-y-8">
          <AnnouncementCreator />
          <Card className="shadow-lg border-none bg-white">
            <CardHeader>
              <CardTitle>Quick Tasks</CardTitle>
              <CardDescription>Daily checklist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TaskItem title="Check Room 201 BP" status="pending" />
              <TaskItem title="Discharge Patient A-4" status="done" />
              <TaskItem title="Prepare OT for Dr. Li" status="pending" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon, color }: any) {
  return (
    <Card className="border-none shadow-lg overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{value}</h3>
          </div>
          <div className={`${color} p-4 rounded-2xl text-white shadow-inner group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TaskItem({ title, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <span className={`text-sm ${status === 'done' ? 'line-through text-slate-400' : 'font-medium text-slate-700'}`}>{title}</span>
      <div className={`h-2 w-2 rounded-full ${status === 'done' ? 'bg-green-500' : 'bg-orange-500'} shadow-sm animate-pulse`} />
    </div>
  )
}
