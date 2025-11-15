// AppointmentDialog.tsx
'use client'
import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

type FormField = {
  id: string
  label: string
  value?: string | null
  placeholder?: string | null
  required?: boolean
}

type FormType = {
  id: string
  title: string
  fields: Record<string, string> // 🔥 keys = questions, value = response string
}


type UserRef = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

export type AppointmentFull = {
  id: string
  visit_date: string | Date
  visit_status: string
  case?: string | null
  questions?: string[] | null
  remarks?: string[] | null
  patient?: UserRef | null
  medical_staff?: UserRef | null
  form?: FormType | null // Change this line
  form_id?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentFull | null
}

export function AppointmentDialog({ open, onOpenChange, appointment }: Props) {
  const [localAppointment, setLocalAppointment] = React.useState<AppointmentFull | null>(null)
  const [loadingForms, setLoadingForms] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // load forms when dialog opens (if not present)
  React.useEffect(() => {
    console.log('AppointmentDialog open changed:', open, appointment)
    if (!open || !appointment) return

    setLocalAppointment(appointment)

    // If form already present, skip
    if (appointment.form) return

    const load = async () => {
      if (!appointment.form_id) return  // 🔥 correct field

      setLoadingForms(true)
      try {
        const res = await fetch(`/api/dbhandler?model=form&appointmentId=${appointment.id}`)
        const data = await res.json()
        console.log('Loaded forms for appointment:', data)

        setLocalAppointment(ap =>
          ap ? { ...ap, form: data[0] ?? null } : null
        );

      } finally {
        setLoadingForms(false)
      }
    }

    load()
  }, [open, appointment])


  // helper to update a field value in memory
  const handleFieldChange = (formId: string, fieldId: string, newValue: string) => {
    setLocalAppointment(prev => {
      if (!prev?.form || prev.form.id !== formId) return prev;

      return {
        ...prev,
        form: {
          ...prev.form,
          fields: {
            ...prev.form.fields,
            [fieldId]: newValue
          }
        }
      };
    });
  };



  // allow editing top-level appointment fields (date, status, case)
  const setVisitDate = (val: string) => {
    setLocalAppointment(prev => prev ? { ...prev, visit_date: val } : prev)
  }
  const setVisitStatus = (val: string) => {
    setLocalAppointment(prev => prev ? { ...prev, visit_status: val } : prev)
  }
  const setCase = (val: string) => {
    setLocalAppointment(prev => prev ? { ...prev, case: val } : prev)
  }

  const handleSave = async () => {
    if (!localAppointment) return;
    setSaving(true);
    try {
      const payload = {
        id: localAppointment.id,
        visit_date: new Date(localAppointment.visit_date).toISOString(),
        visit_status: localAppointment.visit_status,
        case: localAppointment.case,
        form: localAppointment.form ? {
          id: localAppointment.form.id,
          fields: localAppointment.form.fields,
        } : null,
      };

      await fetch(`/api/dbhandler?model=appointment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      toast({ title: 'Saved appointment & form' });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            View & edit appointment information and any associated forms (text fields).
          </DialogDescription>
        </DialogHeader>

        {!localAppointment ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label>Patient</Label>
                <div className="text-sm">
                  {localAppointment.patient ? `${localAppointment.patient.first_name ?? ''} ${localAppointment.patient.last_name ?? ''}` : '—'}
                </div>
              </div>
              <div>
                <Label>Medical Staff</Label>
                <div className="text-sm">
                  {localAppointment.medical_staff ? `${localAppointment.medical_staff.first_name ?? ''} ${localAppointment.medical_staff.last_name ?? ''}` : '—'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div>
                <Label htmlFor="visit-date">Visit Date & Time</Label>
                <Input
                  id="visit-date"
                  type="datetime-local"
                  value={new Date(localAppointment.visit_date).toISOString().slice(0,16)}
                  onChange={e => setVisitDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="visit-status">Status</Label>
                <Input id="visit-status" value={localAppointment.visit_status ?? ''} onChange={e => setVisitStatus(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="case">Case</Label>
                <Input id="case" value={localAppointment.case ?? ''} onChange={e => setCase(e.target.value)} />
              </div>
            </div>





            

            <div>
              <h4 className="text-sm font-medium">Forms</h4>
              {loadingForms ? (
                <div className="p-4">Loading forms…</div>
              ) : (
                <div className="space-y-4">
                  {localAppointment.form ? (
                    <div key={localAppointment.form.id} className="rounded-md border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold">{localAppointment.form.title}</div>
                      </div>
                      <div className="grid gap-3">
                        {localAppointment.form?.fields && Object.keys(localAppointment.form.fields).length > 0 ? (
                          Object.entries(localAppointment.form.fields).map(([key, value]) => (
                            <div key={key}>
                              <Label className="text-xs">{key}</Label>
                              <Input
                                value={value ?? ''}
                                onChange={e =>
                                  handleFieldChange(localAppointment.form!.id, key, e.target.value)
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No fields defined for this form.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">No forms attached to this appointment.</div>
                  )}
                </div>
              )}
            </div>


          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
