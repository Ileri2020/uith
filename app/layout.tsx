import { EnvVarWarning } from '@/components/env-var-warning'
import HeaderAuth from '@/components/header-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
// import { hasEnvVars } from '@/utils/supabase/check-env-vars'
import { ThemeProvider } from 'next-themes'
import Link from 'next/link'
import './globals.css'
import { AppContextProvider } from '@/context/appContext'
import Navbar from '../components/utility/navbar';
import { SessionProvider } from "next-auth/react"
import { usersession } from "@/session";
import { Footer3 } from '@/components/myComponents/subs/footer3'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'UITH General Surgery Department Management System',
  description:
    'A full-stack Hospital Management System built for managing hospital data.',
}

export const SEO_CONFIG = {
  description:
   'A full-stack Hospital Management System built for managing hospital data.',
  fullName: 'UITH General Surgery Department Management System',
  name: "UITH General Surgery Department Management System",
  slogan: "Your health, our priority",
};

export const SYSTEM_CONFIG = {
  redirectAfterSignIn: "/",
  redirectAfterSignUp: "/",
  // repoName: "relivator",
  // repoOwner: "blefnk",
  // repoStars: true,
};

interface Session {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires: string
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session: Session | null = (await usersession()) ?? null;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider  session={session}>
        <body className="min-h-screen bg-background font-sans antialiased">
          <AppContextProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex min-h-screen flex-col">
                {/* <header className="border-b bg-card text-card-foreground shadow-sm">
                  
                </header> */}
                <Navbar />

                <main className="flex-1 container mx-auto">{children}</main>

                
                <Footer3 />
              </div>
            </ThemeProvider>
          </AppContextProvider>
        </body>
      </SessionProvider>
    </html>
  )
}


