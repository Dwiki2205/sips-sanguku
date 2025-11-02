import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'SIPS - Sistem Informasi Pengelolaan Sanguku',
  description: 'Sistem Informasi untuk mengelola booking dan membership Sanguku',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}