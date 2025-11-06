import { EnvVarWarning } from '@/components/env-var-warning'
import HeaderAuth from '@/components/header-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
// import { hasEnvVars } from '@/utils/supabase/check-env-vars'
import { ThemeProvider } from 'next-themes'
import Link from 'next/link'
import './globals.css'
import { AppContextProvider } from '@/context/appContext'
import Navbar from '../components/utility/navbar';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Hospital Management System',
  description:
    'A full-stack Hospital Management System built with Next.js, Supabase, Tailwind CSS, and ShadCN for CPE241 Final Project at KMUTT.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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

            <footer className="border-t border-border text-muted-foreground text-xs text-center py-6">
              <div className="container mx-auto flex h-4 items-center justify-between px-4">
                <p>
                  Hospital Management System -{' '}
                  <a
                    href="https://github.com/parunchxi/hospital-management-system"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-primary"
                  >
                    GitHub
                  </a>
                </p>
                <ThemeSwitcher />
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </AppContextProvider>
      </body>
    </html>
  )
}
