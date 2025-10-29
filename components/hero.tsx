'use client'
import { Button } from './ui/button'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="text-center py-20 px-6 md:px-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        UITH Hospital Management System
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8">
        Efficiently manage patients, appointments, and staff.
      </p>
      <div className='flex flex-col md:flex-row gap-2 mx-auto max-w-lg my-3 justify-center items-center'>
        <Link href={'/patient'}><Button>Patient</Button></Link>
        <Link href={'/doctor'}><Button>Doctor</Button></Link>
        <Link href={'/nurse'}><Button>Nurse</Button></Link>
        <Link href={'/pharmacy'}><Button>Phamacy</Button></Link>
        {/* <Link href={'/admin'}><Button>Admin</Button></Link> */}
      </div>
      <div className="flex justify-center gap-2">
        <Button asChild variant="secondary" size="lg">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild variant="default" size="lg">
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    </section>
  )
}
