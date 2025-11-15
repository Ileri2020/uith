'use client'
import { Button } from './ui/button'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="text-center py-20 px-3 md:px-12 w-full">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 w-full">
         <div className='text-accent'>UITH Hospital</div>
         <div>Management System</div>
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8">
        Efficiently manage patients, appointments, and staff.
      </p>
      <div className='flex flex-col md:flex-row gap-2 mx-auto w-full max-w-lg my-3 justify-center items-center'>
        {/* <Link href={'/patient'} ><Button>Patient</Button></Link>
        <Link href={'/doctor'}><Button>Doctor</Button></Link>
        <Link href={'/nurse'}><Button>Nurse</Button></Link> */}
        <Link href={'/pharmacy'} className='w-full'><Button className='w-full'>Phamacy</Button></Link>
        {/* <Link href={'/admin'}><Button>Admin</Button></Link> */}
      </div>
      
      <div className="flex justify-center gap-2">
        <Button asChild variant="secondary" size="lg" className='bg-primary/10 border-2 border-accent/50'>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild className='bg-accent' variant="default" size="lg">
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
      <div className='mt-5 flex flex-column items-center justify-center'>
        <div className="font-semibold text-xl mb-2">Announcement</div>
      </div>
    </section>
  )
}
