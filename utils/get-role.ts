import { createClient } from '@/utils/supabase/server'

type UserRoleResult = {
  role: string
  userId: string
}

export async function getUserRole(): Promise<UserRoleResult | null> {
  // const supabase = await createClient()

  // const {
  //   data: { user },
  //   error: userError,
  // } = await supabase.auth.getUser()

  // if (userError || !user) {
  //   console.error('Authentication failed:', userError)
  //   return null
  // }

  // const { data: staffData, error: staffError } = await supabase
  //   .from('medical_staff')
  //   .select('staff_type')
  //   .eq('user_id', user.id)
  //   .single()

  // if (staffError) {
  //   if (staffError.code === 'PGRST116') {
  //     // No matching staff: probably a patient
  //     return { role: 'Patient', userId: user.id }
  //   }
  //   console.error('Error checking role:', staffError)
  //   return null
  // }






//   return {
//     role:  'Patient',
//     userId: '01',//user.id,
//   }
  return {
    role:  'Doctor',
    userId: '01',//user.id,
  }
//   return {
//     role:  'Nurse',
//     userId: '01',//user.id,
//   }
//   return {
//     role:  'Pharmacist',
//     userId: '01',//user.id,
//   }
//   return {
//     role:  'Administrator',
//     userId: '01',//user.id,
//   }
 }
