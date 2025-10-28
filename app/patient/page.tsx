'use client'

import React, { useState, useEffect, useCallback } from 'react'
import PatientInfoCard from '@/components/patient/patient-info-card'
import AppointmentCalendarCard from '@/components/patient/appointment-calendar-card'
import UpcomingAppointmentsTable from '@/components/patient/upcoming-appointments-table'
import BillingSummaryTable from '@/components/patient/billing-summary-table'
import SummaryStatsCard from '@/components/patient/summary-stats-card'
import { Skeleton } from '@/components/ui/skeleton'
import { getGreeting } from '@/utils/greeting'
import ErrorPage from '@/app/error'
import { useAppContext } from '@/hooks/useAppContext'

function SkeletonLoader() {
  return (
    <div className="flex flex-col w-full gap-4 px-4 py-10 container mx-auto @container">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-1/3" />
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <div className="hidden sm:grid gap-4 md:grid-cols-2 col-span-2">
          <Skeleton className="h-40" />
        </div>
      </section>
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  )
}

export default function PatientDashboard() {
  interface PatientProfile {
    blood_type: string
    emergency_contact_id: number | null
    users: {
      address: string
      last_name: string
      first_name: string
      national_id: number
      phone_number: string
      date_of_birth: string
    }
  }

  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(
    null,
  )
  const [appointments, setAppointments] = useState([])
  const [billing, setBilling] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {user} = useAppContext()

  const mockpatientinfo = {
    blood_type: 'A+',
    emergency_contact_id: 101,
    users: {
      address: '123 Health St, Bangkok, Thailand',
      last_name: 'Smith',
      first_name: 'John',
      national_id: 1234567890123,
      phone_number: '0812345678',
      date_of_birth: '1985-06-15',
    },
  }
  const mockappointments = [
    {
      visit_date: '2024-06-10T09:00:00Z',
      visit_status: 'Scheduled' as const,
      medical_staff: {
        users: {
          last_name: 'Johnson',
          first_name: 'Dr. Emily',
        },
      },
    },
    {
      visit_date: '2024-06-15T14:30:00Z',
      visit_status: 'Completed' as const,
      medical_staff: {
        users: {
          last_name: 'Williams',
          first_name: 'Dr. Michael',
        },
      },
    },
    {
      visit_date: '2024-06-20T11:00:00Z',
      visit_status: 'Canceled' as const,
      medical_staff: {
        users: {
          last_name: 'Brown',
          first_name: 'Dr. Sarah',
        },
      },
    }
  ]
  const mockBilling = [
    {
      bill_id: 1001,
      total_price: 1250.0,
      status: 'Pending',
      created_at: '2024-06-01T10:00:00Z',
      updated_at: '2024-06-01T10:00:00Z',
      billing_items: [
        {
          item_id: 1,
          quantity: 1,
          item_type: 'Consultation',
          unit_price: 800.0,
          description: 'General physician consultation',
          item_id_ref: 201,
          total_price: 800.0,
        },
        {
          item_id: 2,
          quantity: 2,
          item_type: 'Lab Test',
          unit_price: 225.0,
          description: 'Blood test panel',
          item_id_ref: 305,
          total_price: 450.0,
        },
      ],
    },
    {
      bill_id: 1002,
      total_price: 3200.0,
      status: 'Paid',
      created_at: '2024-05-20T14:20:00Z',
      updated_at: '2024-05-22T09:15:00Z',
      billing_items: [
        {
          item_id: 3,
          quantity: 1,
          item_type: 'Imaging',
          unit_price: 3200.0,
          description: 'X-ray chest',
          item_id_ref: 410,
          total_price: 3200.0,
        },
      ],
    },
  ]

  const fetchData = useCallback(async () => {
    try {
      const [patientResponse, appointmentsResponse, billingResponse] =
        await Promise.all([
          fetch('/api/patients/me'),
          fetch('/api/appointments'),
          fetch('/api/billing/patient/me'),
        ])

      if (!patientResponse.ok) {
        throw new Error('Failed to fetch patient profile')
      }
      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const patientData = await patientResponse.json()
      const appointmentsData = await appointmentsResponse.json()
      const billingData = await billingResponse.json()

      setPatientProfile(patientData)
      setAppointments(appointmentsData)
      setBilling(billingData)
    } catch (err) {
      setError('An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // fetchData()
  }, [fetchData])

  // if (loading) {
  //   return <SkeletonLoader />
  // }

  if (error) {
    return <ErrorPage error={new Error(error)} reset={fetchData} />
  }

  return (
    <div className="flex flex-col w-full gap-4 px-4 py-10 container mx-auto @container">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}{' '}
            {patientProfile?.users
              ? `${patientProfile.users.first_name} ${patientProfile.users.last_name}`
              : 'John Doe'}
          </h1>
        </div>
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PatientInfoCard
          patientProfile={mockpatientinfo}
          //patientProfile={patientProfile }
          refreshData={fetchData}
        />
        <AppointmentCalendarCard 
          //appointments={appointments} 
          appointments={mockappointments} 
        />
        <section className="hidden sm:grid gap-4 md:grid-cols-2 col-span-2">
          <SummaryStatsCard appointments={mockappointments} billing={mockBilling} />
        </section>
      </section>

      <UpcomingAppointmentsTable appointments={appointments} />
      <BillingSummaryTable billing={billing} appointments={appointments} />
    </div>
  )
}
