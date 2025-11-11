'use client'

import React, { useState } from 'react'
import { PatientDetailsDialog } from '@/components/doctor/patient-details-dialog'
import AppointmentsTable from '@/components/doctor/appointments-table'
import MedicineStockTable from '@/components/doctor/medicine-stock-table'
import RoomAvailabilityTable from '@/components/doctor/free-rooms'
import DoctorInfoCard from '@/components/doctor/doctor-info'
import FloatingActionMenu from '@/components/doctor/floating-action-menu'
import DoctorCalendar from '@/components/doctor/calendar'
import { getGreeting } from '@/utils/greeting'
import { useAppContext } from '@/hooks/useAppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Define proper interface for patient records
interface PatientRecord {
  id: string
  name: string
  // Add other patient properties as needed
  [key: string]: any // For any additional properties
}

export default function DoctorDashboard() {
  const {user} = useAppContext()
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(
    null,
  )

  // Function to handle row click from AppointmentsTable
  const handlePatientSelect = (patient: PatientRecord) => {
    setSelectedPatient(patient)
    setPatientDetailsOpen(true)
  }

  return (
    <>
      <main className="flex flex-col w-full gap-4 px-4 py-10 container mx-auto @container">
        <header
          className="flex flex-wrap items-center justify-between gap-4"
          role="banner"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()} <DoctorInfoCard type="name" />
          </h1>
        </header>
        <div><CreateFormButton /></div>

        <section
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          aria-label="Dashboard content"
        >
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            <section aria-labelledby="appointments-heading">
              <h2 id="appointments-heading" className="sr-only">
                Appointments
              </h2>
              <AppointmentsTable onRowClick={handlePatientSelect} />
            </section>

            <section aria-labelledby="medicine-heading">
              <h2 id="medicine-heading" className="sr-only">
                Medicine Stock
              </h2>
              <MedicineStockTable />
            </section>

            <section aria-labelledby="rooms-heading">
              <h2 id="rooms-heading" className="sr-only">
                Room Availability
              </h2>
              <RoomAvailabilityTable />
            </section>
          </div>

          <aside className="grid grid-cols-1 gap-6">
            <DoctorInfoCard />
            <DoctorCalendar />
          </aside>
        </section>


      {/* selected patient dialog, for questioning and diagnostic remarks */}
        <PatientDetailsDialog
          open={patientDetailsOpen}
          onOpenChange={setPatientDetailsOpen}
          patient={selectedPatient}
        />
      </main>

      <FloatingActionMenu />
    </>
  )
}














































import { useToast } from '@/hooks/use-toast'   // <-- adjust the import path

const CreateFormButton = () => {
  const { user } = useAppContext()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<string[]>(['']) // at least one empty question input
  const [isCreating, setIsCreating] = useState(false)

  // add another blank question field
  const addQuestion = () => setQuestions([...questions, ''])

  // remove a question field (skip the first one)
  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: 'Title is required' })
      return
    }
    if (questions.some(q => !q.trim())) {
      toast({ title: 'All question fields must have text' })
      return
    }

    try {
      // turn the question array into a simple JSON object:
      // { q1: "first question", q2: "second question", ... }
      const fields: Record<string, string> = {}
      questions.forEach((q, i) => {
        fields[`question_${i + 1}`] = q
      })

      const res = await fetch(`/api/generic?model=form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          ownerId: user?.id,
          fields,               // <-- now includes the questions
        }),
      })

      if (res.ok) {
        setTitle('')
        setQuestions([''])
        setIsCreating(false)
        toast({ title: 'Form created!' })
        // you could emit an event here to refresh the table
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Something went wrong' })
      }
    } catch (e) {
      toast({ title: 'Network error' })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {isCreating ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Form title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <Button onClick={handleCreate}>Save</Button>
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>

          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  placeholder={`Question ${idx + 1}`}
                  value={q}
                  onChange={e => {
                    const newQs = [...questions]
                    newQs[idx] = e.target.value
                    setQuestions(newQs)
                  }}
                />
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(idx)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={addQuestion}>
            Add Question
          </Button>
        </div>
      ) : (
        <Button onClick={() => setIsCreating(true)}>Create Form</Button>
      )}
    </div>
  )
}