//@ts-nocheck 
'use server'

import { encodedRedirect } from '@/utils/utils'
// import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/utils/get-role'
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

export const signUpAction = async (formData: FormData) => {
  const first_name = formData.get('first_name')?.toString()
  const last_name = formData.get('last_name')?.toString()
  const date_of_birth = formData.get('date_of_birth')?.toString()
  const gender = formData.get('gender')?.toString()
  const national_id = formData.get('national_id')
  const address = formData.get('address')?.toString()
  const phone_number = formData.get('phone_number')
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const confirm_password = formData.get('confirm_password')?.toString()
  const blood_type = formData.get('blood_type')?.toString()
  const emergency_contact = formData.get('emergency_contact')?.toString()
  

  // const supabase = await createClient()  
  // const origin = (await headers()).get('origin')
  console.log(formData)
  if (
    !first_name?.trim() ||
    !last_name?.trim() ||
    !date_of_birth?.trim() ||
    !gender?.trim() ||
    !national_id?.toString().trim() ||
    !address?.trim() ||
    !phone_number?.toString().trim() ||
    !email?.trim() ||
    !password?.trim() ||
    !confirm_password?.trim() ||
    !blood_type?.trim() ||
    !emergency_contact?.trim()
  ) {
    const missingFields = []
    if (!first_name?.trim()) missingFields.push('First Name')
    if (!last_name?.trim()) missingFields.push('Last Name')
    if (!date_of_birth?.trim()) missingFields.push('Date of Birth')
    if (!gender?.trim()) missingFields.push('Gender')
    if (!national_id?.toString().trim()) missingFields.push('National ID')
    if (!address?.trim()) missingFields.push('Address')
    if (!phone_number?.toString().trim()) missingFields.push('Phone Number')
    if (!email?.trim()) missingFields.push('Email')
    if (!password?.trim()) missingFields.push('Password')
    if (!confirm_password?.trim()) missingFields.push('Confirm Password')
    if (!blood_type?.trim()) missingFields.push('Blood Type')
    if (!emergency_contact?.trim()) missingFields.push('Emergency Contact')

    return encodedRedirect(
      'error',
      '/sign-up',
      `The following fields are required: ${missingFields.join(', ')}`,
    )
  }

  if (password !== confirm_password) {
    return encodedRedirect('error', '/sign-up', 'Passwords do not match')
  }

  // const { data: signupData, error: signupError } = await supabase.auth.signUp({
  //   email,
  //   password,
  //   options: {
  //     emailRedirectTo: `${origin}/auth/callback`,
  //   },
  // })

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const User = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
        date_of_birth,
        gender,
        national_id: `${national_id}`,
        address,
        phone_number,
        blood_type,
        emergency_contact,
      },
    });

    // if (signupError) {
    //   console.error(signupError.code + ' ' + signupError.message)
    //   return encodedRedirect('error', '/sign-up', signupError.message)
    // }
    // const User = signupData.user
    // const { error: patientError } = await supabase.from('patients').insert({
    //   user_id: User.id,
    //   blood_type,
    //   emergency_contact_id: emergency_contact,
    // })
  
    // if (patientError) {
    //   console.error(patientError.code + ' ' + patientError.message)
    //   return encodedRedirect(
    //     'error',
    //     '/sign-up',
    //     'User signup succeeded but saving patient profile failed.',
    //   )
    // }

    if (!User) {
      console.error('Signup succeeded but user object is null')
      return encodedRedirect('error', '/sign-up', 'Signup failed unexpectedly.')
  }

    return encodedRedirect(
      'success',
      '/sign-up',
      'Thanks for signing up! Please check your email for a verification link.',
    );
  } catch (error) {
    console.error(error);
    return encodedRedirect('error', '/sign-up', 'Error creating user');
  }
};



export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let user = null
  // const supabase = await createClient()

  // const { error } = await supabase.auth.signInWithPassword({
  //   email,
  //   password,
  // })

  try {
    user = await prisma.user.findUnique({
      where: { email },
    });
    const isvalid = await bcrypt.compare(password, user.password)
    if(isvalid){
    // const { id, ...updateduser } = user;
    // const updateduser = user;
    // return new Response(JSON.stringify(updateduser), {
    //   status: 200,
    //   headers: { 'Content-Type': 'application/json' },
    // });
    } else {
      return encodedRedirect('error', '/sign-in', 'wrong password')
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    // return new Response(
    //   JSON.stringify({ error: 'Failed to Login' }),
    //   { status: 405, headers: { 'Content-Type': 'application/json' } }
    // );
  }


  // const result = await getUserRole()
  const result = {
    role: user.role,//staffData?.staff_type || 'Patient',
    userId: user.id,
  }

  if (!result) {
    return encodedRedirect('error', '/sign-in', 'Unauthorized')
  }

  const { role, userId } = result
  if (role === 'Patient') {
    return redirect('/patient')
  } else if (role === 'Doctor') {
    return redirect('/doctor')
  } else if (role === 'Pharmacist') {
    return redirect('/pharmacy')
  } else if (role === 'Nurse') {
    return redirect('/nurse')
  } else if (role === 'Admin') {
    return redirect('/admin')
  }
  return redirect('/')
}


export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const prisma = new PrismaClient();
  const origin = (await headers()).get('origin');
  const callbackUrl = formData.get('callbackUrl')?.toString();

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required');
  }

  try {
    // Generate a password reset token
    const token = Math.random().toString(36).substr(2, 10);
    const hashedToken = await bcrypt.hash(token, 10);

    // Update the user's password reset token
    await prisma.user.update({
      where: { email },
      data: { passwordResetToken: hashedToken },
    });

    // Send the password reset email
    // You would typically use a library like nodemailer or sendgrid to send emails
    // For this example, we'll just log the token
    console.log(`Password reset token: ${token}`);

    if (callbackUrl) {
      return redirect(callbackUrl);
    }

    return encodedRedirect(
      'success',
      '/forgot-password',
      'Check your email for a link to reset your password.',
    );
  } catch (error) {
    console.error(error);
    return encodedRedirect('error', '/forgot-password', 'Could not reset password');
  }
};



export const resetPasswordAction = async (formData: FormData) => {
  const prisma = new PrismaClient();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const token = formData.get('token') as string;

  if (!password || !confirmPassword) {
    return encodedRedirect('error', '/reset-password', 'Password and confirm password are required');
  }

  if (password !== confirmPassword) {
    return encodedRedirect('error', '/reset-password', 'Passwords do not match');
  }

  try {
    // Find the user with the provided token
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return encodedRedirect('error', '/reset-password', 'Invalid token');
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordResetToken: null },
    });

    return encodedRedirect('success', '/reset-password', 'Password updated');
  } catch (error) {
    console.error(error);
    return encodedRedirect('error', '/reset-password', 'Password update failed');
  }
};



export const signOutAction = async () => {
  // const supabase = await createClient()
  // await supabase.auth.signOut()
  return redirect('/sign-in')
}











// export const forgotPasswordAction = async (formData: FormData) => {
//   const email = formData.get('email')?.toString()
//   const supabase = await createClient()
//   const origin = (await headers()).get('origin')
//   const callbackUrl = formData.get('callbackUrl')?.toString()

//   if (!email) {
//     return encodedRedirect('error', '/forgot-password', 'Email is required')
//   }

//   const { error } = await supabase.auth.resetPasswordForEmail(email, {
//     redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
//   })

//   if (error) {
//     console.error(error.message)
//     return encodedRedirect(
//       'error',
//       '/forgot-password',
//       'Could not reset password',
//     )
//   }

//   if (callbackUrl) {
//     return redirect(callbackUrl)
//   }

//   return encodedRedirect(
//     'success',
//     '/forgot-password',
//     'Check your email for a link to reset your password.',
//   )
// }

// export const resetPasswordAction = async (formData: FormData) => {
//   const supabase = await createClient()
//   const password = formData.get('password') as string
//   const confirmPassword = formData.get('confirmPassword') as string

//   if (!password || !confirmPassword) {
//     return encodedRedirect(
//       'error',
//       '/reset-password',
//       'Password and confirm password are required',
//     )
//   }

//   if (password !== confirmPassword) {
//     return encodedRedirect('error', '/reset-password', 'Passwords do not match')
//   }

//   const { error } = await supabase.auth.updateUser({
//     password: password,
//   })

//   if (error) {
//     return encodedRedirect('error', '/reset-password', 'Password update failed')
//   }

//   return encodedRedirect('success', '/reset-password', 'Password updated')
// }