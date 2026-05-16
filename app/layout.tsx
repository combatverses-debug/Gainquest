import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import SessionProvider from './SessionProvider'

export const metadata: Metadata = {
  title: 'Gainquest',
  description: 'Turn your workouts into legend',
  manifest: '/manifest.json',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
