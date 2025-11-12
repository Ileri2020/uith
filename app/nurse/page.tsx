'use client'

import React, { useState, useEffect } from 'react'
import { PatientDetailsDialog } from '@/components/nurse/patient-details-dialog'
import AssignedPatientsTable from '@/components/nurse/assigned-patients-table'
import NurseInfoCard from '@/components/nurse/nurse-info'
import { useAppContext } from '@/hooks/useAppContext'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientTable } from '@/components/nurse/patients-table'
import { BookingDialog } from '@/components/nurse/appointment-booking'

export default function NurseDashboard() {
  const {user} = useAppContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [nurseName, setNurseName] = useState<string>('')
  const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      date_of_birth: '',
      phone_number: '',
      address: '',
      national_id: '',
      role: 'patient',
    });
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const response = await fetch('/api/dbhandler?model=user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        console.log(data);
        // Handle success or error
        if (response.ok) {
          alert('Patient account created successfully!');
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            date_of_birth: '',
            phone_number: '',
            address: '',
            national_id: '',
            role: 'patient',
          });
        } else {
          alert('Error creating patient account: ' + data.message);
        }
      } catch (error) {
        console.error(error);
      }
    };

  const mockNurse = {
    staff_id: 101,
    license_number: 'RN-987654321',
    date_hired: '2022-03-15',
    users: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone_number: '5551234567',
      date_of_birth: '1988-07-22',
      address: '123 Care Lane, MedCity',
      national_id: '9876543210',
    },
    departments: {
      name: 'Emergency',
    },
  }

  const mockAdmissions = [
    {
      admission_id: 'A001',
      patient_id: 'P1001',
      room_id: 'ER-12',
      admission_date: '2025-10-20T08:00:00Z',
      discharge_date: null,
      rooms: {
        departments: { name: 'Emergency' },
      },
      patients: {
        patient_id: 'P1001',
        blood_type: 'O+',
        users: {
          first_name: 'Michael',
          last_name: 'Chen',
          phone_number: '5559876543',
          date_of_birth: '1995-04-10',
          address: '456 Health St, MedCity',
          national_id: '1122334455',
        },
      },
    },
    {
      admission_id: 'A002',
      patient_id: 'P1002',
      room_id: 'ER-15',
      admission_date: '2025-10-22T14:30:00Z',
      discharge_date: '2025-10-25T10:00:00Z',
      rooms: {
        departments: { name: 'Emergency' },
      },
      patients: {
        patient_id: 'P1002',
        blood_type: 'A-',
        users: {
          first_name: 'Emma',
          last_name: 'Rodriguez',
          phone_number: '5552223333',
          date_of_birth: '1979-11-30',
          address: '789 Wellness Ave, MedCity',
          national_id: '6677889900',
        },
      },
    },
    {
      admission_id: 'A003',
      patient_id: 'P1003',
      room_id: 'ER-08',
      admission_date: '2025-10-25T09:15:00Z',
      discharge_date: null,
      rooms: {
        departments: { name: 'Emergency' },
      },
      patients: {
        patient_id: 'P1003',
        blood_type: 'B+',
        users: {
          first_name: 'James',
          last_name: 'Wilson',
          phone_number: '5554445555',
          date_of_birth: '2001-02-14',
          address: '321 Recovery Blvd, MedCity',
          national_id: '5544332211',
        },
      },
    },
  ]

  useEffect(() => {
    // Fetch nurse name for greeting
    // fetch('/api/staff/me')
    //   .then((res) => {
    //     if (res.ok) return res.json()
    //     return { users: { first_name: 'Nurse' } }
    //   })
    //   .then((data) => {
    //     setNurseName(data.users?.first_name || 'Nurse')
    //   })
    //   .catch((err) => {
    //     console.error('Error fetching nurse info:', err)
    //   })
    setNurseName(`Nurse ${mockNurse.users.last_name} ${mockNurse.users.first_name}`)
  }, [])

  // Function to handle row click from AssignedPatientsTable
  const handleRowClick = (patient: any) => {
    setSelectedPatient(patient)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="flex flex-col w-full gap-4 px-4 py-10 container mx-auto @container">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {nurseName}
          </h1>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <PatientTable />
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            <AssignedPatientsTable admissionslst={mockAdmissions} onRowClick={handleRowClick} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <NurseInfoCard nurseobj={mockNurse} />
          </div>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Patient Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>First Name:</Label>
                  <Input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                  <Label>Last Name:</Label>
                  <Input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                  <Label>Email:</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  <Label>Password:</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  <Label>Date of Birth:</Label>
                  <Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                  <Label>Phone Number:</Label>
                  <Input type="text" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                  <Label>Address:</Label>
                  <Input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  <Label>National ID:</Label>
                  <Input type="text" value={formData.national_id} onChange={(e) => setFormData({ ...formData, national_id: e.target.value })} />
                </div>
                <CardFooter className="justify-end">
                  <Button type="submit">Create Account</Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </section>

        <PatientDetailsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          patient={selectedPatient}
        />
      </div>
    </>
  )
}

































































































